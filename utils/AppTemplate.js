const CoreTemplate = require('./CoreTemplate')

class AppTemplate extends CoreTemplate {
  constructor (name) {
    super(name)
    this.middlewares = [
      {
        module: {
          importName: 'logger',
          from: 'morgan'
        },
        appUse: ["logger('dev')"]
      },
      {
        appUse: [
          'express.json()',
          'express.urlencoded({ extended: false })']
      },
      {
        module: {
          importName: 'cookieParser',
          from: 'cookie-parser'
        },
        appUse: ['cookieParser()']
      },
      {
        module: {
          importName: 'helmet',
          from: 'helmet'
        },
        appUse: ['helmet()']
      },
      {
        module: {
          importName: 'cors',
          from: 'cors'
        },
        appUse: ['cors()']
      },
      {
        module: {
          importName: 'compression',
          from: 'compression'
        },
        appUse: ['compression()']
      }
    ]
  }
  addMiddlewares () {
    this.middlewares.forEach(({ module, appUse }) => {
      if (module) {
        super.addModule(module.importName, module.from)
      }
      appUse.forEach(u => super.addAppUse(u))
    })
  }
}

module.exports = AppTemplate
