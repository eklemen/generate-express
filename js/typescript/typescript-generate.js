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

const codeSnippets = require('../code-snippets');
const tsConstants = require('./constants')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)
var TEMPLATE_DIR = path.join(__dirname, '../..', 'templates')

const createApp = function (name, directory, viewInput, dbInput, cacheInput, program) {
  const hasView = viewInput !== 'none - api only'
  const { dir } = program

  const pkg = { ...codeSnippets.pkg };
  pkg.name = kebabCase(name);

  pkg.scripts = {
    "build": "npm run build-sass && npm run build-ts && npm run lint && npm run copy-static-assets",
    "build-sass": "node-sass src/public/css/main.scss dist/public/css/main.css",
    "build-ts": "tsc",
    "copy-static-assets": "ts-node copyStaticAssets.ts",
    "debug": "npm run build && npm run watch-debug",
    "lint": "tsc --noEmit && eslint \"**/*.{js,ts}\" --quiet --fix",
    "serve": "node dist/server.js",
    "serve-debug": "nodemon --inspect dist/server.js",
    "start": "npm run serve",
    "watch": "concurrently -k -p \"[{name}]\" -n \"Sass,TypeScript,Node\" -c \"yellow.bold,cyan.bold,green.bold\" \"npm run watch-sass\" \"npm run watch-ts\" \"npm run watch-node\"",
    "watch-debug": "concurrently -k -p \"[{name}]\" -n \"Sass,TypeScript,Node\" -c \"yellow.bold,cyan.bold,green.bold\" \"npm run watch-sass\" \"npm run watch-ts\" \"npm run serve-debug\"",
    "watch-node": "nodemon dist/server.js",
    "watch-sass": "node-sass -w src/public/css/main.scss dist/public/css/main.css",
    "watch-test": "npm run test -- --watchAll",
    "watch-ts": "tsc -w"
  }

  pkg.devDependencies = tsConstants.devDependencies;

  pkg.dependencies = tsConstants.dependencies;

  // Starts with app.ts file
  const app = loadTemplate('ts-msft/src/app.ts');

   // App modules
   app.locals.localModules = Object.create(null)
   app.locals.modules = Object.create(null)
   app.locals.uses = []

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



   // write files
   write(path.join(dir, `src/app.ts`), app.render())
   write(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
   copyTemplate('ts-msft/src/server.ts', path.join(dir, 'src/server.ts'))
  //  write(path.join(dir, '.env'), env.render())
};






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

/**
 * Copy file from template directory.
 */

function copyTemplate (from, to) {
  write(to, fs.readFileSync(path.join(TEMPLATE_DIR, from), 'utf-8'))
}

/**
 * Load template file.
 */

function loadTemplate (name) {
  console.log("DIREDCTOTOTT", __dirname)
  const contents = fs.readFileSync(path.join(__dirname, '../..', 'templates', (name + '.ejs')), 'utf-8')
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
 * Copy multiple files from template directory.
 */

function copyTemplateMulti (fromDir, toDir, nameGlob) {
  fs.readdirSync(path.join(TEMPLATE_DIR, fromDir))
    .filter(minimatch.filter(nameGlob, { matchBase: true }))
    .forEach(function (name) {
      copyTemplate(path.join(fromDir, name), path.join(toDir, name))
    })
}

module.exports = createApp;
