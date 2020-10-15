const Scaffold = require('../../utils/Scaffold')
const path = require('path')
const tools = require('../../utils/tools')
jest.mock('../../utils/tools')

describe('Scaffold Class', () => {
  let scaffold
  let initParams = {
    hasTs: false,
    dir: 'test-app',
    directory: './test-app',
    tsjs: 'js'
  }
  beforeEach(() => {
    tools.mkdir.mockReset()
    tools.copyTemplate.mockReset()
    tools.copyTemplateMulti.mockReset()
    tools.write.mockReset()
    scaffold = new Scaffold(initParams)
  })
  test('default values', () => {
    expect(scaffold.hasTs).toBe(false)
    expect(scaffold.dir).toBe('test-app')
    expect(scaffold.directory).toBe('./test-app')
    expect(scaffold.tsjs).toBe('js')
  })
  describe('Methods ', () => {
    test('.init()', () => {
      scaffold.init()
      expect(tools.mkdir).toHaveBeenCalledWith(scaffold.directory, '.')
    })
    test('.init() when directory is not current', () => {
      scaffold.directory = '.'
      scaffold.init()
      expect(tools.mkdir).not.toHaveBeenCalled()
    })
    test('.createCoreFiles() JS', () => {
      const mockPackageJson = { name: 'mockpackagejson' }
      scaffold.createCoreFiles(mockPackageJson)
      expect(tools.copyTemplate).toHaveBeenCalledWith('js/babelrc', 'test-app/.babelrc')
      expect(tools.copyTemplate).not.toHaveBeenCalledWith('ts/tsconfig.json', 'test-app/tsconfig.json')
      expect(tools.mkdir).toHaveBeenCalledWith(scaffold.dir, 'server/bin')
      expect(tools.copyTemplate).toHaveBeenCalledWith('js/eslintrc.js', 'test-app/.eslintrc.js')
      expect(tools.write).toHaveBeenCalledWith(scaffold.dir + '/package.json', JSON.stringify(mockPackageJson, null, 2) + '\n')
    })
    test('.createCoreFiles() TS', () => {
      scaffold.hasTs = true
      const mockPackageJson = { name: 'mockpackagejson' }
      scaffold.createCoreFiles(mockPackageJson)
      expect(tools.copyTemplate).not.toHaveBeenCalledWith('js/babelrc', 'test-app/.babelrc')
      expect(tools.copyTemplate).toHaveBeenCalledWith('ts/tsconfig.json', 'test-app/tsconfig.json')
      expect(tools.mkdir).toHaveBeenCalledWith(scaffold.dir, 'server/bin')
      expect(tools.copyTemplate).toHaveBeenCalledWith('js/eslintrc.js', 'test-app/.eslintrc.js')
      expect(tools.write).toHaveBeenCalledWith(scaffold.dir + '/package.json', JSON.stringify(mockPackageJson, null, 2) + '\n')
    })
    test('.createRouteFiles() JS', () => {
      scaffold.createRouteFiles()
      expect(tools.mkdir).toHaveBeenCalledTimes(1)
      expect(tools.mkdir).toHaveBeenCalledWith(scaffold.directory, 'server/routes')
      expect(tools.copyTemplate).toHaveBeenCalledTimes(3)
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'js/routes/users.js',
        'test-app/server/routes/users.js'
      )
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'js/routes/index.js',
        'test-app/server/routes/index.js'
      )
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'js/routes/hello.js',
        'test-app/server/routes/hello.js'
      )
    })
    test('.createRouteFiles() TS', () => {
      scaffold.tsjs = 'ts'
      scaffold.createRouteFiles()
      expect(tools.mkdir).toHaveBeenCalledTimes(1)
      expect(tools.mkdir).toHaveBeenCalledWith(scaffold.directory, 'server/routes')
      expect(tools.copyTemplate).toHaveBeenCalledTimes(3)
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'ts/routes/users.ts',
        'test-app/server/routes/users.ts'
      )
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'ts/routes/index.ts',
        'test-app/server/routes/index.ts'
      )
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'ts/routes/hello.ts',
        'test-app/server/routes/hello.ts'
      )
    })
    test('.createDefaultControllerFiles() JS', () => {
      scaffold.createDefaultControllerFiles()
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'js/controllers/userController.default.js',
        'test-app/server/controllers/userController.js'
      )
    })
    test('.createDefaultControllerFiles() TS', () => {
      scaffold.tsjs = 'ts'
      scaffold.createDefaultControllerFiles()
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'ts/controllers/userController.default.ts',
        'test-app/server/controllers/userController.ts'
      )
    })
    test('.createMongooseFiles() JS', () => {
      scaffold.createMongooseFiles()
      expect(tools.mkdir).toHaveBeenCalledWith(
        'test-app', 'server/models'
      )
      expect(tools.copyTemplateMulti).toHaveBeenCalledWith(
        'js/models/mongoose',
        'test-app/server/models',
        '*.js'
      )
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'js/controllers/userController.mongo.js',
        'test-app/server/controllers/userController.js'
      )
    })
    test('.createMongooseFiles() TS', () => {
      scaffold.tsjs = 'ts'
      scaffold.createMongooseFiles()
      expect(tools.mkdir).toHaveBeenCalledWith(
        'test-app', 'server/models'
      )
      expect(tools.copyTemplateMulti).toHaveBeenCalledWith(
        'ts/models/mongoose',
        'test-app/server/models',
        '*.ts'
      )
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'ts/controllers/userController.mongo.ts',
        'test-app/server/controllers/userController.ts'
      )
    })
    test('.createSequelizeFiles() JS', () => {
      scaffold.createSequelizeFiles()
      expect(tools.mkdir).toHaveBeenCalledTimes(2)
      expect(tools.copyTemplateMulti).toHaveBeenCalledTimes(2)
      expect(tools.copyTemplate).toHaveBeenCalledTimes(1)
      expect(tools.mkdir).toHaveBeenCalledWith(
        'test-app', 'server/config'
      )
      expect(tools.mkdir).toHaveBeenCalledWith(
        'test-app', 'server/models'
      )
      expect(tools.copyTemplateMulti).toHaveBeenCalledWith(
        'js/models/sequelize/config',
        'test-app/server/config',
        '*.js'
      )
      expect(tools.copyTemplateMulti).toHaveBeenCalledWith(
        'js/models/sequelize',
        'test-app/server/models',
        '*.js'
      )
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'js/controllers/userController.sql.js',
        'test-app/server/controllers/userController.js'
      )
    })
    test('.createSequelizeFiles() TS', () => {
      scaffold.tsjs = 'ts'
      scaffold.createSequelizeFiles()
      expect(tools.mkdir).toHaveBeenCalledTimes(2)
      expect(tools.copyTemplateMulti).toHaveBeenCalledTimes(2)
      expect(tools.copyTemplate).toHaveBeenCalledTimes(1)
      expect(tools.mkdir).toHaveBeenCalledWith(
        'test-app', 'server/config'
      )
      expect(tools.mkdir).toHaveBeenCalledWith(
        'test-app', 'server/models'
      )
      expect(tools.copyTemplateMulti).toHaveBeenCalledWith(
        'ts/models/sequelize/config',
        'test-app/server/config',
        '*.ts'
      )
      expect(tools.copyTemplateMulti).toHaveBeenCalledWith(
        'ts/models/sequelize',
        'test-app/server/models',
        '*.ts'
      )
      expect(tools.copyTemplate).toHaveBeenCalledWith(
        'ts/controllers/userController.sql.ts',
        'test-app/server/controllers/userController.ts'
      )
    })
    test('.createGitIgnore() when TRUE creates file', () => {
      scaffold.createGitIgnore(true)
      expect(tools.copyTemplate).toHaveBeenCalledWith('js/gitignore', 'test-app/.gitignore')
    })
    test('.createGitIgnore() when FALSE does not creates file', () => {
      scaffold.createGitIgnore(false)
      expect(tools.copyTemplate).not.toHaveBeenCalled()
    })
    test('.createTestingFiles() with "mongoose" db', () => {
      scaffold.createTestingFiles('mongoose')
      expect(tools.mkdir).toHaveBeenCalledWith(scaffold.dir, 'tests/routes')
      expect(tools.copyTemplate).toHaveBeenNthCalledWith(1, 'js/testFiles/mongo/hello.js', 'test-app/tests/routes/hello.spec.js')
      expect(tools.copyTemplate).toHaveBeenNthCalledWith(2, 'js/testFiles/mongo/users.js', 'test-app/tests/routes/users.spec.js')
      expect(tools.copyTemplate).toHaveBeenNthCalledWith(3, 'js/jestConfig.js', 'test-app/jest.config.js')
    })
  })
})
