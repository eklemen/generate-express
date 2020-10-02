const CoreTemplate = require('../../utils/CoreTemplate')

describe('CoreTemplate class', () => {
  let coreTemplate
  beforeEach(() => {
    coreTemplate = new CoreTemplate('www')
  })
  test('class defaults', () => {
    expect(coreTemplate.locals.name).toEqual('www')
    expect(coreTemplate.locals.localModules).toEqual({})
    expect(coreTemplate.locals.modules).toEqual({})
    expect(coreTemplate.locals.mounts).toEqual([])
    expect(coreTemplate.locals.uses).toEqual([])
    expect(coreTemplate.locals.db).toEqual(false)
    expect(coreTemplate.locals.cache).toEqual(false)
  })
  describe('class methods', () => {
    test('.addModule() with default import', () => {
      coreTemplate.addModule('logger', 'morgan')
      expect(coreTemplate.locals.modules.logger).toEqual('morgan')
    })
    test('.addModule() with import *', () => {
      coreTemplate.addModule('* as logger', 'morgan')
      expect(coreTemplate.locals.modules['* as logger']).toEqual('morgan')
    })
    test('.addLocalModule() with default import', () => {
      coreTemplate.addModule('db', './db')
      expect(coreTemplate.locals.modules.db).toEqual('./db')
    })
    test('.addLocalModule() with * as alias', () => {
      coreTemplate.addModule('* as routes', './routes')
      expect(coreTemplate.locals.modules['* as routes']).toEqual('./routes')
      coreTemplate.addModule('* as models', '../../models')
      expect(coreTemplate.locals.modules['* as models']).toEqual('../../models')
    })
    test('.addUseRoute() mount route with controller', () => {
      coreTemplate.addUseRoute('/api', 'routes.hello')
      expect(coreTemplate.locals.mounts[0]).toEqual({
        path: '/api',
        code: 'routes.hello'
      })
      coreTemplate.addUseRoute('/api/users', 'routes.users')
      expect(coreTemplate.locals.mounts[1]).toEqual({
        path: '/api/users',
        code: 'routes.users'
      })
    })
    test('.addAppUse() push middleware to uses[]', () => {
      coreTemplate.addAppUse('cors()')
      expect(coreTemplate.locals.uses[0]).toEqual('cors()')
      coreTemplate.addAppUse('express.urlencoded({ extended: false })')
      expect(coreTemplate.locals.uses[1]).toEqual('express.urlencoded({ extended: false })')
    })
  })
})
