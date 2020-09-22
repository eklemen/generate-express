#!/usr/bin/env node

var path = require('path')
var readline = require('readline')
var inquirer = require('inquirer')
var chalk = require('chalk')
var rimraf = require('rimraf')
var execSync = require('child_process').execSync

var MODE_0755 = parseInt('0755', 8)
var codeSnippets = require('../utils/code-snippets')
var Pkg = require('../utils/Package')
var tools = require('../utils/tools')

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
const isJs = t => t === SCRIPT_TYPE.JS
const isTs = t => !isJs(t)
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
    {
      when: function (response) {
        return isTs(response.typescript)
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
        return isJs(response.typescript)
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
    const hasTs = isTs(program.typescript)
    const tsjs = hasTs ? 'ts' : 'js'

    if (!exit.exited) {
      main()
    }

    /**
     * Create application at the given directory.
     *
     * @param {string} name
     * @param {string} dir
     */

    function createApplication (name, directory) {
      // Package
      const pkg = new Pkg({ name, hasTs, program }).init()

      const app = tools.loadTemplate(`${tsjs}/app.${tsjs}`)
      const www = tools.loadTemplate(`${tsjs}/www`)
      const env = tools.loadTemplate(`${tsjs}/.env`)

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

      // Body parsers
      app.locals.uses.push('express.json()')
      app.locals.uses.push('express.urlencoded({ extended: false })')

      // Cookie parser
      app.locals.modules.cookieParser = 'cookie-parser'
      app.locals.uses.push('cookieParser()')

      // Helmet
      app.locals.modules.helmet = 'helmet'
      app.locals.uses.push('helmet()')

      // CORS
      app.locals.modules.cors = 'cors'
      app.locals.uses.push('cors()')

      // Compression middleware
      app.locals.modules.compression = 'compression'
      app.locals.uses.push('compression()')

      if (directory !== '.') {
        tools.mkdir(directory, '.')
      }

      // copy route templates
      tools.mkdir(directory, 'server/routes')
      tools.copyTemplate(`${tsjs}/routes/users.${tsjs}`, path.join(dir, `/server/routes/users.${tsjs}`))
      tools.copyTemplate(`${tsjs}/routes/index.${tsjs}`, path.join(dir, `/server/routes/index.${tsjs}`))
      tools.copyTemplate(`${tsjs}/routes/hello.${tsjs}`, path.join(dir, `/server/routes/hello.${tsjs}`))

      // Database
      www.locals.db = false
      app.locals.db = false
      env.locals.db = false
      tools.mkdir(dir, 'server/controllers')
      switch (program.database) {
        case 'mongojs':
          app.locals.modules.mongojs = 'mongojs'
          app.locals.db = codeSnippets.mongoJsCode
          tools.copyTemplate(`${tsjs}/controllers/userController.default.${tsjs}`, path.join(dir, `/server/controllers/userController.${tsjs}`))
          break
        case 'sequelize':
          // TODO: prompt for which flavor of SQL (mysql/pg/maria/sqlite)
          if (hasTs) {
            www.locals.db = codeSnippets.sequelizeCodeTS
          } else {
            www.locals.db = codeSnippets.sequelizeCode
          }
          env.locals.db = codeSnippets.sequelizeEnvironmentVars

          tools.mkdir(dir, 'server/config')
          tools.copyTemplateMulti(`${tsjs}/models/sequelize/config`, `${dir}/server/config`, `*.${tsjs}`)
          tools.mkdir(dir, 'server/models')
          tools.copyTemplateMulti(`${tsjs}/models/sequelize`, `${dir}/server/models`, `*.${tsjs}`)
          tools.copyTemplate(`${tsjs}/controllers/userController.sql.${tsjs}`, path.join(dir, `/server/controllers/userController.${tsjs}`))
          break
        case 'mongo + mongoose':
          app.locals.modules.mongoose = 'mongoose'
          app.locals.db = codeSnippets.mongoMongooseCode
          tools.mkdir(dir, 'server/models')
          tools.copyTemplateMulti(`${tsjs}/models/mongoose`, `${dir}/server/models`, `*.${tsjs}`)
          tools.copyTemplate(`${tsjs}/controllers/userController.mongo.${tsjs}`, path.join(dir, `/server/controllers/userController.${tsjs}`))
          break
        default:
          tools.copyTemplate(`${tsjs}/controllers/userController.default.${tsjs}`, path.join(dir, `/server/controllers/userController.${tsjs}`))
      }

      // Caching
      app.locals.cache = false
      env.locals.cache = false
      switch (program.cache) {
        case 'redis':
          app.locals.modules.redis = 'redis'
          app.locals.cache = codeSnippets.redisCode
          env.locals.cache = codeSnippets.redisEnvironmentVars
      }

      // Index router mount
      app.locals.localModules['* as routes'] = './routes'
      // Mount routes to app.use()
      app.locals.mounts.push({ path: '/api', code: 'routes.hello' })
      app.locals.mounts.push({ path: '/api/users', code: 'routes.users' })

      if (program.gitignore) {
        tools.copyTemplate(`${tsjs}/gitignore`, path.join(dir, '.gitignore'))
      }

      // write files
      tools.write(path.join(dir, `server/app.${tsjs}`), app.render())
      tools.write(path.join(dir, 'package.json'), JSON.stringify(pkg.package, null, 2) + '\n')
      if (hasTs) {
        tools.copyTemplate('ts/tsconfig.json', path.join(dir, 'tsconfig.json'))
      } else {
        tools.copyTemplate('js/babelrc', path.join(dir, '.babelrc'))
      }
      tools.mkdir(dir, 'server/bin')
      tools.write(path.join(dir, `server/bin/www.${tsjs}`), www.render(), MODE_0755)
      tools.write(path.join(dir, '.env'), env.render())
      tools.copyTemplate(`${tsjs}/eslintrc.js`, path.join(dir, '.eslintrc.js'))
      npmInstall()
      gitInit()
      printInfoLogs()
    }

    // Install npm dependencies
    let depsInstalled = false
    function npmInstall () {
      console.log(chalk.blue.bold('Installing npm packages...'))
      try {
        execSync(`cd ${dir} && npm install`, { stdio: 'inherit' })
        depsInstalled = true
      } catch (err) {
        console.log(
          chalk.red(
            `Warning: dependencies failed to install. Please run ${chalk.blue('npm install')}`
          ))
      }
    }
    function gitInit () {
      execSync(`cd ${dir} && git init`, { stdio: 'inherit' })
    }

    // Print informational logs
    function printInfoLogs () {
      if (dir !== '.') {
        console.log()
        console.log('  change directory:')
        console.log(chalk.blue.bold(`    cd ${dir}`))
      }

      if (!depsInstalled) {
        console.log()
        console.log('  install dependencies:')
        console.log(chalk.blue.bold(`    npm install`))
      }
      console.log()
      console.log('  run the app in dev watch mode:')
      console.log(chalk.blue.bold('    npm start'))
      console.log()
      console.log('Hello world: ', chalk.cyan.underline('localhost:3001/api'))
      console.log('GET /users: ', chalk.cyan.underline('localhost:3001/api/users'))

      if (program.database === 'sequelize') {
        console.log()
        console.log(chalk.yellow('   NOTE: You must update the `.env` file with your database settings before starting.'))
      }
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
      tools.emptyDirectory(destinationPath, function (empty) {
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
