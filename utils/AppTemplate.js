const CoreTemplate = require('./CoreTemplate')
const codeSnippets = require('./code-snippets')

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
  addRoutes () {
    // Index router mount
    super.addLocalModule('* as routes', './routes')
    // Mount routes to app.use()
    super.addUseRoute('/api', 'routes.hello')
    super.addUseRoute('/api/users', 'routes.users')
  }
  addDb (db) {
    const dbSnippets = {
      mongojs: codeSnippets.mongoJsCode,
      mongoose: codeSnippets.mongoMongooseCode
    }
    super.addModule(db, db)
    this.locals.db = dbSnippets[db]
  }
  addCache (cache) {
    const cacheSnippets = {
      redis: codeSnippets.redisCode
    }
    super.addModule(cache, cache)
    this.locals.cache = cacheSnippets[cache]
  }
}

module.exports = AppTemplate
