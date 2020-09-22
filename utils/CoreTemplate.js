var ejs = require('ejs')
var fs = require('fs')
var path = require('path')
var util = require('util')

class CoreTemplate {
  constructor (name) {
    this.name = name
    this.localModules = {}
    this.modules = {}
    this.mounts = []
    this.uses = []
  }

  render () {
    const contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (this.name + '.ejs')), 'utf-8')
    const locals = Object.create(null)
    return ejs.render(contents, locals, {
      escape: util.inspect
    })
  }
}

module.exports = CoreTemplate
