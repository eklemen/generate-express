var ejs = require('ejs')
var fs = require('fs')
var path = require('path')
var util = require('util')

class CoreTemplate {
  constructor (name) {
    this.locals = {
      name: name,
      localModules: {},
      modules: {},
      mounts: [],
      uses: [],
      db: false,
      cache: false
    }
  }

  addModule (importName, packageName) {
    // import importName from 'packageName';
    this.locals.modules[importName] = packageName
  }

  addLocalModule (importName, packageName) {
    // import importName from './packageName';
    this.locals.localModules[importName] = packageName
  }

  addUseRoute (endpoint, controller) {
    this.locals.mounts.push({ path: endpoint, code: controller })
  }

  addAppUse (middleware) {
    this.locals.uses.push(middleware)
  }

  render () {
    const contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (this.locals.name + '.ejs')), 'utf-8')
    return ejs.render(contents, this.locals, {
      escape: util.inspect
    })
  }
}

module.exports = CoreTemplate
