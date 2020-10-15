#!/usr/bin/env node

const path = require('path')
const readline = require('readline')
const inquirer = require('inquirer')
const chalk = require('chalk')
const rimraf = require('rimraf')
const execSync = require('child_process').execSync

const MODE_0755 = parseInt('0755', 8)
const codeSnippets = require('../utils/code-snippets')
const Pkg = require('../utils/Package')
const tools = require('../utils/tools')
const CoreTemplate = require('../utils/CoreTemplate')
const AppTemplate = require('../utils/AppTemplate')
const Scaffold = require('../utils/Scaffold')

const _exit = process.exit

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
      when: function (response) {
        return response.database === 'sequelize'
      },
      type: 'list',
      name: 'sqlEngine',
      message: 'Choose SQL engine',
      choices: [
        'MySQL',
        'Postgres',
        'MariaDB'
      ],
      default: 'MySQL'
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

      const scaffold = new Scaffold({ hasTs, dir, directory, tsjs })
        .init()
        .createRouteFiles()
        .createGitIgnore(program.gitignore)
      const app = new AppTemplate(`${tsjs}/app.${tsjs}`)
      const www = new CoreTemplate(`${tsjs}/www`)
      const env = new CoreTemplate(`${tsjs}/.env`)

      app.addMiddlewares()
      app.addRoutes()

      // Database
      tools.mkdir(dir, 'server/controllers')
      switch (program.database) {
        case 'mongojs':
          app.addDb(program.database)
          scaffold.createDefaultControllerFiles()
          break
        case 'sequelize':
          // TODO: prompt for which flavor of SQL (mysql/pg/maria/sqlite)
          www.locals.db = hasTs
            ? www.locals.db = codeSnippets.sequelizeCodeTS
            : www.locals.db = codeSnippets.sequelizeCode
          env.locals.db = codeSnippets.sequelizeEnvVars[program.sqlEngine]
          scaffold.createSequelizeFiles(program.sqlEngine)
          break
        case 'mongo + mongoose':
          app.addDb('mongoose')
          scaffold
            .createMongooseFiles()
            .createTestingFiles('mongoose')
          break
        default:
          scaffold.createDefaultControllerFiles()
      }

      // Caching
      switch (program.cache) {
        case 'redis':
          app.addCache(program.cache)
          env.locals.cache = codeSnippets.redisEnvironmentVars
      }

      // Put it all together: write files based on configs
      scaffold.createCoreFiles(pkg.package)
      // build template.ejs files for app, www, env
      tools.write(path.join(dir, `server/app.${tsjs}`), app.render())
      tools.write(path.join(dir, `server/bin/www.${tsjs}`), www.render(), MODE_0755)
      tools.write(path.join(dir, '.env'), env.render())
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
