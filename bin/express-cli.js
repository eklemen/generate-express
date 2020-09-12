#!/usr/bin/env node

var ejs = require('ejs')
var fs = require('fs')
var minimatch = require('minimatch')
var mkdirp = require('mkdirp')
var path = require('path')
var readline = require('readline')
var sortedObject = require('sorted-object')
var util = require('util')
var inquirer = require('inquirer')
var kebabCase = require('lodash.kebabcase')
var chalk = require('chalk')
var rimraf = require('rimraf')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)
var TEMPLATE_DIR = path.join(__dirname, '..', 'templates')
var codeSnippets = require('../js/code-snippets')

var _exit = process.exit

// CLI
let dirDefaultName = 'hello-world'
if (process.argv[2] && process.argv[2].trim().length) {
  dirDefaultName = process.argv[2]
}
const SCRIPT_TYPE = {
  JS: 'Javascript es6+',
  TS: 'Typescript'
}
inquirer
  .prompt([
    {
      name: 'dir',
      message: 'Application name:',
      default: dirDefaultName
    },
    {
      type: 'list',
      name: 'typescript',
      message: 'Use Typescript or Javascript es6+',
      choices: [
        SCRIPT_TYPE.JS,
        SCRIPT_TYPE.TS
      ],
      default: SCRIPT_TYPE.JS
    },
    {
      type: 'confirm',
      name: 'gitignore',
      message: 'Include a .gitignore?',
      default: true
    },
    // TODO: add dynamodb
    {
      when: function (response) {
        return response.typescript === SCRIPT_TYPE.TS
      },
      // Remove mongojs if Typescript is selected due to missing @types
      type: 'list',
      name: 'database',
      message: 'Include database config:',
      choices: [
        'none',
        'mongo + mongoose',
        'sequelize'
      ],
      default: 'none'
    },
    {
      when: function (response) {
        return response.typescript === SCRIPT_TYPE.JS
      },
      type: 'list',
      name: 'database',
      message: 'Include database config:',
      choices: [
        'none',
        'mongojs',
        'mongo + mongoose',
        'sequelize'
      ],
      default: 'none'
    },
    {
      when: function (response) {
        // Only ask for view engine if Javascript is selected
        return response.typescript === SCRIPT_TYPE.JS
      },
      type: 'list',
      name: 'view',
      message: 'View engine or just API:',
      choices: [
        'none - api only',
        'dust',
        'ejs',
        'hbs',
        'hjs',
        'pug',
        'twig',
        'vash'
      ],
      default: 'none'
    },
    {
      type: 'list',
      name: 'cache',
      message: 'Include cache:',
      choices: [
        'none',
        'redis'
      ]
    }
  ])
  .then(program => {
    const {
      dir
    } = program
    const hasView = program.view !== 'none - api only'
    const hasTs = program.typescript === SCRIPT_TYPE.TS
    const tsjs = hasTs ? 'ts' : 'js'

    if (!exit.exited) {
      main()
    }

    /**
     * Copy file from template directory.
     */

    function copyTemplate (from, to) {
      write(to, fs.readFileSync(path.join(TEMPLATE_DIR, from), 'utf-8'))
    }

    /**
     * Copy multiple files from template directory.
     */

    function copyTemplateMulti (fromDir, toDir, nameGlob) {
      fs.readdirSync(path.join(TEMPLATE_DIR, fromDir))
        .filter(minimatch.filter(nameGlob, { matchBase: true }))
        .forEach(function (name) {
          copyTemplate(path.join(fromDir, name), path.join(toDir, name))
        })
    }

    /**
     * Create application at the given directory.
     *
     * @param {string} name
     * @param {string} dir
     */

    function createApplication (name, directory) {
      // Package
      const pkg = { ...codeSnippets.pkg }
      pkg.name = kebabCase(name)
      if (hasTs) {
        pkg.scripts.transpile = 'tsc'
        pkg.devDependencies['@types/compression'] = '^1.7.0'
        pkg.devDependencies['@types/cookie-parser'] = '1.4.2'
        pkg.devDependencies['@types/cors'] = '^2.8.6'
        pkg.devDependencies['@types/debug'] = '^4.1.5'
        pkg.devDependencies['@types/express'] = '^4.17.6'
        pkg.devDependencies['@types/helmet'] = '0.0.47'
        pkg.devDependencies['@types/morgan'] = '^1.9.1'
        pkg.devDependencies.tslib = '^2.0.0'
        pkg.devDependencies.typescript = '^3.9.5'
        pkg.devDependencies.dotenv = '^8.2.0'
        pkg.nodemonConfig.ext = 'ts'
      } else {
        pkg.scripts.transpile = 'babel ./server --out-dir dist --copy-files'
        pkg.devDependencies['babel-plugin-inline-dotenv'] = '^1.5.0'
        pkg.devDependencies['@babel/cli'] = '^7.8.4'
        pkg.devDependencies['@babel/core'] = '^7.9.0'
        pkg.devDependencies['@babel/node'] = '^7.8.7'
        pkg.devDependencies['@babel/preset-env'] = '^7.9.0'
      }

      const app = loadTemplate(`${tsjs}/app.${tsjs}`)
      const www = loadTemplate(`${tsjs}/www`)
      const env = loadTemplate(`${tsjs}/.env`)

      // App name
      www.locals.name = name

      // App modules
      app.locals.localModules = Object.create(null)
      app.locals.modules = Object.create(null)
      app.locals.mounts = []
      app.locals.uses = []

      // Request logger
      app.locals.modules.logger = 'morgan'
      app.locals.uses.push("logger('dev')")
      pkg.dependencies.morgan = '^1.9.1'

      // Body parsers
      app.locals.uses.push('express.json()')
      app.locals.uses.push('express.urlencoded({ extended: false })')

      // Cookie parser
      app.locals.modules.cookieParser = 'cookie-parser'
      app.locals.uses.push('cookieParser()')
      pkg.dependencies['cookie-parser'] = '^1.4.4'

      // Helmet
      app.locals.modules.helmet = 'helmet'
      app.locals.uses.push('helmet()')
      pkg.dependencies['helmet'] = '^3.22.0'

      // CORS
      app.locals.modules.cors = 'cors'
      app.locals.uses.push('cors()')
      pkg.dependencies['cors'] = '^2.8.5'

      // Compression middleware
      app.locals.modules.compression = 'compression'
      app.locals.uses.push('compression()')
      pkg.dependencies['compression'] = '^1.7.4'

      if (directory !== '.') {
        mkdir(directory, '.')
      }

      if (hasView) {
        // Copy view templates
        mkdir(directory, 'public')
        mkdir(directory, 'public/javascripts')
        mkdir(directory, 'public/images')
        mkdir(directory, 'public/stylesheets')
        mkdir(directory, 'server/views')
        pkg.dependencies['http-errors'] = '~1.6.3'
        switch (program.view) {
          case 'dust':
            copyTemplateMulti('views', directory + '/server/views', '*.dust')
            break
          case 'ejs':
            copyTemplateMulti('views', directory + '/server/views', '*.ejs')
            break
          case 'hbs':
            copyTemplateMulti('views', directory + '/server/views', '*.hbs')
            break
          case 'hjs':
            copyTemplateMulti('views', directory + '/server/views', '*.hjs')
            break
          case 'jade':
            copyTemplateMulti('views', directory + '/server/views', '*.jade')
            break
          case 'pug':
            copyTemplateMulti('views', directory + '/server/views', '*.pug')
            break
          case 'twig':
            copyTemplateMulti('views', directory + '/server/views', '*.twig')
            break
          case 'vash':
            copyTemplateMulti('views', directory + '/server/views', '*.vash')
            break
          case 'none - api only':
            break
        }
      }

      if (hasView) {
        // copy css templates
        switch (program.css) {
          case 'less':
            copyTemplateMulti('css', directory + '/public/stylesheets', '*.less')
            break
          case 'stylus':
            copyTemplateMulti('css', directory + '/public/stylesheets', '*.styl')
            break
          case 'compass':
            copyTemplateMulti('css', directory + '/public/stylesheets', '*.scss')
            break
          case 'sass':
            copyTemplateMulti('css', directory + '/public/stylesheets', '*.sass')
            break
          default:
            copyTemplateMulti('css', directory + '/public/stylesheets', '*.css')
            break
        }
      } else {
        console.log('Since api only was chosen, no css linking occurred.')
        console.log('To add css, create /public/stylesheets/style.css')
      }

      // copy route templates
      mkdir(directory, 'server/routes')
      // TODO: rename the javascript route file names to match ts (helloRoute)
      if (hasTs) {
        copyTemplate(`${tsjs}/routes/users.${tsjs}`, path.join(dir, `/server/routes/users.${tsjs}`))
        copyTemplate(`${tsjs}/routes/hello.${tsjs}`, path.join(dir, `/server/routes/index.${tsjs}`))
      } else {
        copyTemplate(`${tsjs}/routes/users.${tsjs}`, path.join(dir, `/server/routes/users.${tsjs}`))
        if (hasView && !hasTs) {
          copyTemplate(`${tsjs}/routes/index.${tsjs}`, path.join(dir, `/server/routes/index.${tsjs}`))
        } else {
          copyTemplate(`${tsjs}/routes/apiOnly.${tsjs}`, path.join(dir, `/server/routes/index.${tsjs}`))
        }
      }

      // Database
      www.locals.db = false
      app.locals.db = false
      env.locals.db = false
      mkdir(dir, 'server/controllers')
      switch (program.database) {
        case 'mongojs':
          pkg.dependencies['mongojs'] = '^3.1.0'
          if (hasTs) pkg.devDependencies['@types/mongojs'] = '^4.1.5'
          app.locals.modules.mongojs = 'mongojs'
          app.locals.db = codeSnippets.mongoJsCode
          copyTemplate(`${tsjs}/controllers/userController.default.${tsjs}`, path.join(dir, `/server/controllers/userController.${tsjs}`))
          break
        case 'sequelize':
          // TODO: prompt for which flavor of SQL (mysql/pg/maria/sqlite)
          pkg.dependencies['mysql2'] = '^1.6.4'
          pkg.dependencies['sequelize'] = '^6.3.5'
          if (hasTs) {
            pkg.dependencies['@types/sequelize'] = '^4.28.9'
            www.locals.db = codeSnippets.sequelizeCodeTS
          } else {
            app.locals.localModules.db = './models'
            www.locals.db = codeSnippets.sequelizeCode
          }
          env.locals.db = codeSnippets.sequelizeEnvironmentVars

          mkdir(dir, 'server/config')
          copyTemplateMulti(`${tsjs}/models/sequelize/config`, `${dir}/server/config`, `*.${tsjs}`)
          mkdir(dir, 'server/models')
          copyTemplateMulti(`${tsjs}/models/sequelize`, `${dir}/server/models`, `*.${tsjs}`)
          copyTemplate(`${tsjs}/controllers/userController.sql.${tsjs}`, path.join(dir, `/server/controllers/userController.${tsjs}`))
          break
        case 'mongo + mongoose':
          pkg.dependencies['mongoose'] = '^5.3.16'
          pkg.devDependencies['@types/mongoose'] = '^5.7.24'
          app.locals.modules.mongoose = 'mongoose'
          app.locals.db = codeSnippets.mongoMongooseCode
          mkdir(dir, 'server/models')
          copyTemplateMulti(`${tsjs}/models/mongoose`, `${dir}/server/models`, `*.${tsjs}`)
          copyTemplate(`${tsjs}/controllers/userController.mongo.${tsjs}`, path.join(dir, `/server/controllers/userController.${tsjs}`))
          break
        default:
          copyTemplate(`${tsjs}/controllers/userController.default.${tsjs}`, path.join(dir, `/server/controllers/userController.${tsjs}`))
      }

      // Caching
      app.locals.cache = false
      env.locals.cache = false
      switch (program.cache) {
        case 'redis':
          pkg.dependencies['redis'] = '^3.0.2'
          app.locals.modules.redis = 'redis'
          app.locals.cache = codeSnippets.redisCode
          env.locals.cache = codeSnippets.redisEnvironmentVars
          if (hasTs) {
            pkg.devDependencies['@types/redis'] = '^2.8.27'
          } else {

          }
      }

      if (program.view) {
        // CSS Engine support
        switch (program.css) {
          case 'compass':
            app.locals.modules.compass = 'node-compass'
            app.locals.uses.push("compass({ mode: 'expanded' })")
            pkg.dependencies['node-compass'] = '0.2.3'
            break
          case 'less':
            app.locals.modules.lessMiddleware = 'less-middleware'
            app.locals.uses.push("lessMiddleware(path.join(__dirname, 'public'))")
            pkg.dependencies['less-middleware'] = '~2.2.1'
            break
          case 'sass':
            app.locals.modules.sassMiddleware = 'node-sass-middleware'
            app.locals.uses.push("sassMiddleware({\n  src: path.join(__dirname, 'public'),\n  dest: path.join(__dirname, 'public'),\n  indentedSyntax: true, // true = .sass and false = .scss\n  sourceMap: true\n})")
            pkg.dependencies['node-sass-middleware'] = '0.11.0'
            break
          case 'stylus':
            app.locals.modules.stylus = 'stylus'
            app.locals.uses.push("stylus.middleware(path.join(__dirname, 'public'))")
            pkg.dependencies['stylus'] = '0.54.5'
            break
        }
      }

      // Index router mount
      // TODO: make routes/index only export
      // app.locals.localModules['* as routes'] = './routes/index'

      app.locals.localModules.helloRouter = './routes/index'
      app.locals.mounts.push({ path: '/api', code: 'helloRouter' })

      // User router mount
      app.locals.localModules.usersRouter = './routes/users'
      app.locals.mounts.push({ path: '/api/users', code: 'usersRouter' })

      // Template support
      switch (program.view) {
        case 'dust':
          app.locals.modules.adaro = 'adaro'
          app.locals.view = {
            engine: 'dust',
            render: 'adaro.dust()'
          }
          pkg.dependencies.adaro = '~1.0.4'
          break
        case 'ejs':
          app.locals.view = { engine: 'ejs' }
          pkg.dependencies.ejs = '~2.6.1'
          break
        case 'hbs':
          app.locals.view = { engine: 'hbs' }
          pkg.dependencies.hbs = '~4.0.4'
          break
        case 'hjs':
          app.locals.view = { engine: 'hjs' }
          pkg.dependencies.hjs = '~0.0.6'
          break
        case 'jade':
          app.locals.view = { engine: 'jade' }
          pkg.dependencies.jade = '~1.11.0'
          break
        case 'pug':
          app.locals.view = { engine: 'pug' }
          pkg.dependencies.pug = '2.0.0-beta11'
          break
        case 'twig':
          app.locals.view = { engine: 'twig' }
          pkg.dependencies.twig = '~0.10.3'
          break
        case 'vash':
          app.locals.view = { engine: 'vash' }
          pkg.dependencies.vash = '~0.12.6'
          break
        default:
          app.locals.view = false
          break
      }

      if (program.gitignore) {
        copyTemplate(`${tsjs}/gitignore`, path.join(dir, '.gitignore'))
      }

      // sort dependencies like npm(1)
      pkg.dependencies = sortedObject(pkg.dependencies)

      // write files
      write(path.join(dir, `server/app.${tsjs}`), app.render())
      write(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
      if (hasTs) {
        copyTemplate('ts/tsconfig.json', path.join(dir, 'tsconfig.json'))
        copyTemplate('ts/tslint.json', path.join(dir, 'tslint.json'))
      } else {
        copyTemplate('js/babelrc', path.join(dir, '.babelrc'))
      }
      mkdir(dir, 'server/bin')
      write(path.join(dir, `server/bin/www.${tsjs}`), www.render(), MODE_0755)
      write(path.join(dir, '.env'), env.render())

      if (dir !== '.') {
        console.log()
        console.log('  change directory:')
        console.log(chalk.blue.bold(`    cd ${dir}`))
      }

      console.log()
      console.log('  install dependencies:')
      console.log(chalk.blue.bold(`    npm install`))
      console.log()
      console.log('  run the app in dev watch mode:')
      console.log(chalk.blue.bold('    npm start'))
      console.log()
      console.log('Hello world: ', chalk.cyan.underline('localhost:3001/api'))

      if (program.database === 'sequelize') {
        console.log()
        console.log(chalk.yellow('   NOTE: You must update the `.env` file with your database settings before starting.'))
      }
    }

    /**
     * Check if the given directory `dir` is empty.
     *
     * @param {String} dir
     * @param {Function} fn
     */

    function emptyDirectory (directory, fn) {
      console.log(directory)
      fs.readdir(directory, function (err, files) {
        if (err && err.code !== 'ENOENT') throw err
        fn(!files || !files.length)
      })
    }

    /**
     * Graceful exit for async STDIO
     */

    function exit (code) {
      // flush output for Node.js Windows pipe bug
      // https://github.com/joyent/node/issues/6247 is just one bug example
      // https://github.com/visionmedia/mocha/issues/333 has a good discussion
      function done () {
        if (!(draining--)) _exit(code)
      }

      let draining = 0
      const streams = [process.stdout, process.stderr]

      exit.exited = true

      streams.forEach(function (stream) {
        // submit empty write request and wait for completion
        draining += 1
        stream.write('', done)
      })

      done()
    }

    /**
     * Load template file.
     */

    function loadTemplate (name) {
      const contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (name + '.ejs')), 'utf-8')
      const locals = Object.create(null)

      function render () {
        return ejs.render(contents, locals, {
          escape: util.inspect
        })
      }

      return {
        locals: locals,
        render: render
      }
    }

    /**
     * Main program.
     */

    function main () {
      // Path
      const destinationPath = './' + dir

      // App name
      const appName = dir

      // Grab input on y/n prompt
      function confirm (msg, callback) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        })

        rl.question(msg, function (input) {
          rl.close()
          callback(/^y|yes|ok|true$/i.test(input))
        })
      }

      // Generate application
      emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
          createApplication(appName, destinationPath)
        } else {
          const message = chalk.red.bold(`WARNING: ./${appName} is not empty, erase contents and continue? [y/N] `)
          confirm(message, function (ok) {
            if (ok) {
              rimraf(destinationPath, function () {
                process.stdin.destroy()
                createApplication(appName, destinationPath)
              })
            } else {
              console.log(chalk.red.bold('aborting'))
              exit(1)
            }
          })
        }
      })
    }

    /**
     * Make the given dir relative to base.
     *
     * @param {string} base
     * @param {string} dir
     */

    function mkdir (base, directory) {
      const loc = path.join(base, directory)
      console.log(chalk.cyan('   create: ' + chalk.green(loc + path.sep)))
      mkdirp.sync(loc, MODE_0755)
    }

    /**
     * echo str > file.
     *
     * @param {String} file
     * @param {String} str
     */

    function write (file, str, mode) {
      fs.writeFileSync(file, str, { mode: mode || MODE_0666 })
      console.log(chalk.cyan('   create : ' + chalk.green(file)))
    }
    process.exit = exit
  })
  .catch(error => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
      console.log(chalk.red.bold('Could not run in the current environment: ' + error))
    } else {
      // Something else when wrong
      console.log(chalk.red.bold('Something went wrong: ' + error))
    }
  })
