var ejs = require('ejs')
var fs = require('fs')
var minimatch = require('minimatch')
var mkdirp = require('mkdirp')
var path = require('path')
var util = require('util')
var chalk = require('chalk')
var TEMPLATE_DIR = path.join(__dirname, '..', 'templates')
var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)

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
 * Copy multiple files from template directory.
 */

function copyTemplateMulti (fromDir, toDir, nameGlob) {
  fs.readdirSync(path.join(TEMPLATE_DIR, fromDir))
    .filter(minimatch.filter(nameGlob, { matchBase: true }))
    .forEach(function (name) {
      copyTemplate(path.join(fromDir, name), path.join(toDir, name))
    })
}

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
 * Make the given dir relative to base.
 *
 * @param {string} base
 * @param {string} dir
 */

function mkdir (base, directory) {
  const loc = path.join(base, directory)
  console.log(chalk.cyan('   create : ' + chalk.green(loc + path.sep)))
  mkdirp.sync(loc, MODE_0755)
}

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 * @param {Function} fn
 */

function emptyDirectory (directory, fn) {
  fs.readdir(directory, function (err, files) {
    if (err && err.code !== 'ENOENT') throw err
    fn(!files || !files.length)
  })
}

module.exports = {
  write,
  copyTemplate,
  copyTemplateMulti,
  mkdir,
  emptyDirectory
}
