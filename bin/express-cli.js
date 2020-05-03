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
inquirer
  .prompt([
    {
      name: 'dir',
      message: 'Application name:',
      default: dirDefaultName
    },
    {
      type: 'confirm',
      name: 'gitignore',
      message: 'Include a .gitignore?',
      default: true
    },
    {
      type: 'list',
      name: 'database',
      message: 'Include database config:',
      // TODO: add dynamodb
      choices: [
        'none',
        'mongojs',
        'mongo + mongoose',
        'sequelize'
      ],
      default: 'none'
    },
    {
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

    if (!exit.exited) {
      main()
    }

    function confirm (msg, callback) {
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.question(msg, function (input) {
        rl.close()
        callback(/^y|yes|ok|true$/i.test(input))
      })
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
      var pkg = {
        name: kebabCase(name),
        version: '1.0.0',
        private: true,
        scripts: {
          'start': 'nodemon',
          'build': 'npm-run-all clean transpile',
          'server': 'node ./dist/bin/www',
          'dev': 'NODE_ENV=development npm-run-all build server',
          'prod': 'NODE_ENV=production npm-run-all build server',
          'transpile': 'babel ./server --out-dir dist --copy-files',
          'clean': 'rimraf dist'
        },
        nodemonConfig: {
          'exec': 'npm run dev',
          'watch': [
            'server/*',
            'public/*'
          ],
          'ignore': [
            '**/__tests__/**',
            '*.test.js',
            '*.spec.js'
          ]
        },
        dependencies: {
          'debug': '~2.6.9',
          'express': '~4.16.1',
          'dotenv': '^8.2.0'
        },
        devDependencies: {
          '@babel/cli': '^7.8.4',
          '@babel/core': '^7.9.0',
          '@babel/node': '^7.8.7',
          '@babel/preset-env': '^7.9.0',
          'jest': '^25.2.7',
          'npm-run-all': '^4.1.5',
          'rimraf': '^3.0.2',
          'nodemon': '^2.0.3'
        }
      }

      // JavaScript
      var app = loadTemplate('js/app.js')
      var www = loadTemplate('js/www')
      var env = loadTemplate('js/.env')

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
      copyTemplate('js/routes/users.js', path.join(dir, '/server/routes/users.js'))
      if (hasView) {
        copyTemplate('js/routes/index.js', path.join(dir, '/server/routes/index.js'))
      } else {
        copyTemplate('js/routes/apiOnly.js', path.join(dir, '/server/routes/index.js'))
      }

      // Database
      www.locals.db = false
      app.locals.db = false
      env.locals.db = false
      mkdir(dir, 'server/controllers')
      switch (program.database) {
        case 'mongojs':
          pkg.dependencies['mongojs'] = '^3.1.0'
          app.locals.modules.mongojs = 'mongojs'
          app.locals.db = codeSnippets.mongoJsCode
          copyTemplate('js/controllers/userController.mongo.js', path.join(dir, '/server/controllers/userController.js'))
          break
        case 'sequelize':
          pkg.dependencies['mysql2'] = '^1.6.4'
          pkg.dependencies['sequelize'] = '^4.41.2'
          app.locals.localModules.db = './models'
          www.locals.db = codeSnippets.sequelizeCode
          env.locals.db = codeSnippets.sequelizeEnvironmentVars

          mkdir(dir, 'server/config')
          copyTemplateMulti('js/models/sequelize/config', dir + '/server/config', '*.js')
          mkdir(dir, 'server/models')
          copyTemplateMulti('js/models/sequelize', dir + '/server/models', '*.js')
          copyTemplate('js/controllers/userController.sql.js', path.join(dir, '/server/controllers/userController.js'))
          break
        case 'mongo + mongoose':
          pkg.dependencies['mongoose'] = '^5.3.16'
          app.locals.modules.mongoose = 'mongoose'
          app.locals.db = codeSnippets.mongoMongooseCode
          mkdir(dir, 'server/models')
          copyTemplateMulti('js/models/mongoose', dir + '/server/models', '*.js')
          copyTemplate('js/controllers/userController.mongo.js', path.join(dir, '/server/controllers/userController.js'))
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
      app.locals.localModules.indexRouter = './routes/index'
      app.locals.mounts.push({ path: '/api', code: 'indexRouter' })

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

      if (program.git) {
        copyTemplate('js/gitignore', path.join(dir, '.gitignore'))
      }

      // sort dependencies like npm(1)
      pkg.dependencies = sortedObject(pkg.dependencies)

      // write files
      write(path.join(dir, 'server/app.js'), app.render())
      write(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
      copyTemplate('js/babelrc', path.join(dir, '.babelrc'))
      mkdir(dir, 'server/bin')
      copyTemplate('js/gitignore', path.join(dir, '.gitignore'))
      write(path.join(dir, 'server/bin/www.js'), www.render(), MODE_0755)
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

      var draining = 0
      var streams = [process.stdout, process.stderr]

      exit.exited = true

      streams.forEach(function (stream) {
        // submit empty write request and wait for completion
        draining += 1
        stream.write('', done)
      })

      done()
    }

    /**
     * Determine if launched from cmd.exe
     */

    function launchedFromCmd () {
      return process.platform === 'win32' &&
        process.env._ === undefined
    }

    /**
     * Load template file.
     */

    function loadTemplate (name) {
      var contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (name + '.ejs')), 'utf-8')
      var locals = Object.create(null)

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
      var destinationPath = './' + dir

      // App name
      var appName = dir

      // Generate application
      emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
          createApplication(appName, destinationPath)
        } else {
          var message = chalk.red.bold(`WARNING: ./${appName} is not empty, erase contents and continue? [y/N] `)
          confirm(message, function (ok) {
            if (ok) {
              rimraf(destinationPath, function () {
                process.stdin.destroy()
                createApplication(appName, destinationPath)
              })
            } else {
              console.error('aborting')
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
      var loc = path.join(base, directory)

      console.log('   \x1b[36mcreate\x1b[0m : ' + loc + path.sep)
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
      console.log('   \x1b[36mcreate\x1b[0m : ' + file)
    }
    process.exit = exit
  })
  .catch(error => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
      console.log(error)
    } else {
      // Something else when wrong
      console.log(error)
    }
  })
