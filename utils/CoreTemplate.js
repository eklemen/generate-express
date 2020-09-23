var ejs = require('ejs')
var fs = require('fs')
var path = require('path')
var util = require('util')

class CoreTemplate {
  get locals () {
    return {
      name: this.name,
      localModules: this.localModules,
      modules: this.modules,
      mounts: this.mounts,
      uses: this.uses,
      db: this.db,
      cache: this.cache
    }
  }

  constructor (name) {
    this.name = name
    this.localModules = {}
    this.modules = {}
    this.mounts = []
    this.uses = []
    this.db = false
    this.cache = false
  }

  addModule (importName, packageName) {
    // import importName from 'packageName';
    this.modules[importName] = packageName
  }

  addLocalModule (importName, packageName) {
    // import importName from './packageName';
    this.localModules[importName] = packageName
  }

  addUseRoute (endpoint, controller) {
    this.mounts.push({ path: endpoint, code: controller })
  }

  addAppUse (middleware) {
    this.uses.push(middleware)
  }

  render () {
    const contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (this.name + '.ejs')), 'utf-8')
    return ejs.render(contents, this.locals, {
      escape: util.inspect
    })
  }
}

module.exports = CoreTemplate
