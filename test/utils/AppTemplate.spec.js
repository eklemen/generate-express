const AppTemplate = require('../../utils/AppTemplate')
const codeSnippets = require('../../utils/code-snippets')
const CoreTemplate = require('../../utils/CoreTemplate')
jest.mock('../../utils/CoreTemplate')

describe('CoreTemplate class', () => {
  let appTemplate
  beforeEach(() => {
    appTemplate = new AppTemplate('app')
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test('class defaults', () => {
    expect(appTemplate.middlewares).toEqual([
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
    ])
  })
  test('.addMiddlewares()', () => {
    let addModuleSpy = jest.spyOn(CoreTemplate.prototype, 'addModule')
    let addAppUseSpy = jest.spyOn(CoreTemplate.prototype, 'addAppUse')
    appTemplate.addMiddlewares()
    expect(addModuleSpy).toHaveBeenCalledTimes(5)
    expect(addAppUseSpy).toHaveBeenCalledTimes(7)
    appTemplate.middlewares.forEach(middleware => {
      middleware.appUse.forEach(app => {
        expect(addAppUseSpy).toHaveBeenCalledWith(app)
      })
    })
  })
  test('.addRoutes()', () => {
    let addLocalModuleSpy = jest.spyOn(CoreTemplate.prototype, 'addLocalModule')
    let addUseRouteSpy = jest.spyOn(CoreTemplate.prototype, 'addUseRoute')
    appTemplate.addRoutes()
    expect(addLocalModuleSpy).toHaveBeenCalledWith('* as routes', './routes')
    expect(addUseRouteSpy).toHaveBeenCalledTimes(2)
    expect(addUseRouteSpy).toHaveBeenNthCalledWith(
      1, '/api', 'routes.hello'
    )
    expect(addUseRouteSpy).toHaveBeenNthCalledWith(
      2, '/api/users', 'routes.users'
    )
  })
  // test('.addDb() with mongoose', () => {
  //   let addModuleSpy = jest.spyOn(CoreTemplate.prototype, 'addModule')
  //   appTemplate.addDb('mongoose')
  //   expect(addModuleSpy).toHaveBeenCalledWith('mongoose', 'mongoose')
  //   // expect(appTemplate.locals.db).toBeDefined()
  // })
})
