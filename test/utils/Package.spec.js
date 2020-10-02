const Package = require('../../utils/Package')

describe('Package Class (package.json)', () => {
  let pkg
  let program = {
    name: 'test-app',
    typescript: 'Javascript es6+',
    gitignore: true,
    database: 'none',
    cache: 'none'
  }
  let initParams = {
    name: 'test-app',
    hasTs: false,
    program
  }
  beforeEach(() => {
    pkg = new Package(initParams)
  })
  describe('Class default values JS', () => {
    test('base', (done) => {
      expect(pkg.base).toEqual({
        name: 'test-app',
        version: '1.0.0',
        private: true,
        main: 'dist/bin/www.js',
        scripts: {
          'start': 'nodemon',
          'build': 'npm-run-all clean transpile',
          'server': 'node ./dist/bin/www',
          'dev': 'NODE_ENV=development npm-run-all build server',
          'prod': 'NODE_ENV=production npm-run-all build server',
          'clean': 'rimraf dist'
        },
        nodemonConfig: {
          'exec': 'npm run dev',
          'watch': [
            'server/*',
            'public/*'
          ],
          'ignore': [
            '**/__tests__/**',
            '*.test.js',
            '*.spec.js'
          ]
        },
        dependencies: {
          'debug': '~2.6.9',
          'express': '~4.16.1'
        },
        devDependencies: {
          'jest': '^25.2.7',
          'npm-run-all': '^4.1.5',
          'rimraf': '^3.0.2',
          'nodemon': '^2.0.3'
        }
      })
      done()
    })
    test('middlewares', (done) => {
      expect(pkg.middlewares).toEqual({
        'morgan': '^1.9.1',
        'cookie-parser': '^1.4.4',
        'helmet': '^3.22.0',
        'cors': '^2.8.5',
        'compression': '^1.7.4'
      })
      done()
    })
  })

  describe('class methods Package', () => {
    beforeEach(() => {
      jest.mock('../../utils/Package')
      pkg = new Package(initParams)
    })

    test('.addTranspiler() with JS', () => {
      pkg.addTranspiler()
      expect(pkg.base.scripts.transpile).toEqual('babel ./server --out-dir dist --copy-files')
    })
    test('.addTranspiler() with TS', () => {
      pkg.hasTs = true
      pkg.addTranspiler()
      expect(pkg.base.scripts.transpile).toEqual('tsc')
      expect(pkg.base.nodemonConfig.ext).toEqual('ts')
    })

    test('.addLanguageDevDeps() with JS', () => {
      jest.spyOn(pkg, 'addBaseJavascript')
      pkg.addLanguageDevDeps()
      expect(pkg.addBaseJavascript).toHaveBeenCalled()
    })
    test('.addLanguageDevDeps() with TS', () => {
      pkg.hasTs = true
      jest.spyOn(pkg, 'addBaseTypescript')
      pkg.addLanguageDevDeps()
      expect(pkg.addBaseTypescript).toHaveBeenCalled()
    })

    test('.addMiddlewares()', () => {
      pkg.addMiddlewares()
      const deps = Object.keys(pkg.base.dependencies)
      Object.keys(pkg.middlewares).forEach(middleware => {
        expect(deps).toContain(middleware)
      })
    })

    test('.addDb() with sequelize JS', () => {
      pkg.db = 'sequelize'
      pkg.addDb()
      expect(pkg).toHaveProperty('base.dependencies.mysql2')
      expect(pkg).toHaveProperty('base.dependencies.sequelize')
    })
    test('.addDb() with sequelize TS', () => {
      pkg.db = 'sequelize'
      pkg.hasTs = true
      pkg.addDb()
      expect(pkg).toHaveProperty('base.dependencies.mysql2')
      expect(pkg).toHaveProperty('base.dependencies.sequelize')
      expect(pkg.base.devDependencies['@types/sequelize']).toBeDefined()
    })
    test('.addDb() with mongoose JS', () => {
      pkg.db = 'mongo + mongoose'
      pkg.addDb()
      expect(pkg).toHaveProperty('base.dependencies.mongoose')
    })
    test('.addDb() with mongoose TS', () => {
      pkg.db = 'mongo + mongoose'
      pkg.hasTs = true
      pkg.addDb()
      expect(pkg).toHaveProperty('base.dependencies.mongoose')
      expect(pkg.base.devDependencies['@types/mongoose']).toBeDefined()
    })

    test('.addCache() with no cache JS', () => {
      pkg.addCache()
      expect(pkg).not.toHaveProperty('base.dependencies.redis')
    })
    test('.addCache() with redis JS', () => {
      pkg.cache = 'redis'
      pkg.addCache()
      expect(pkg).toHaveProperty('base.dependencies.redis')
    })
    test('.addCache() with redis TS', () => {
      pkg.cache = 'redis'
      pkg.hasTs = true
      pkg.addCache()
      expect(pkg).toHaveProperty('base.dependencies.redis')
      expect(pkg.base.devDependencies['@types/redis']).toBeDefined()
    })

    test('.addLint() JS', () => {
      pkg.addLint()
      expect(pkg.base.devDependencies.eslint).toBeDefined()
      expect(pkg.base.devDependencies['eslint-config-airbnb-base']).toBeDefined()
      expect(pkg.base.devDependencies['eslint-plugin-import']).toBeDefined()
      expect(pkg.base.devDependencies['eslint-plugin-import']).toBeDefined()
      expect(pkg.base.scripts.lint).toEqual('eslint ./server')
    })
    test('.addLint() TS', () => {
      pkg.hasTs = true
      pkg.addLint()
      expect(pkg.base.devDependencies.eslint).toBeDefined()
      expect(pkg.base.devDependencies['eslint-config-airbnb-base']).toBeDefined()
      expect(pkg.base.devDependencies['eslint-plugin-import']).toBeDefined()
      expect(pkg.base.devDependencies['eslint-plugin-import']).toBeDefined()
      expect(pkg.base.devDependencies['@typescript-eslint/eslint-plugin']).toBeDefined()
      expect(pkg.base.devDependencies['@typescript-eslint/parser']).toBeDefined()
      expect(pkg.base.devDependencies['eslint-config-airbnb-typescript']).toBeDefined()
      expect(pkg.base.scripts.lint).toEqual('eslint ./server')
    })

    test('getter package', () => {
      const result = pkg.package
      expect(result).toEqual(pkg.base)
    })

    // I couldn't find where jest.mock('../module') works without import
    test('.init()', (done) => {
      const mockAddTranspiler = jest.fn().mockReturnThis()
      Package.prototype.addTranspiler = mockAddTranspiler
      Package.prototype.addLanguageDevDeps = jest.fn().mockReturnValue(pkg)
      Package.prototype.addMiddlewares = jest.fn().mockReturnValue(pkg)
      Package.prototype.addDb = jest.fn().mockReturnValue(pkg)
      Package.prototype.addCache = jest.fn().mockReturnValue(pkg)
      Package.prototype.addLint = jest.fn().mockReturnValue(pkg)
      pkg.init()
      expect(pkg.addTranspiler).toHaveBeenCalled()
      expect(pkg.addLanguageDevDeps).toHaveBeenCalled()
      expect(pkg.addMiddlewares).toHaveBeenCalled()
      expect(pkg.addDb).toHaveBeenCalled()
      expect(pkg.addCache).toHaveBeenCalled()
      expect(pkg.addLint).toHaveBeenCalled()
      mockAddTranspiler.mockRestore()
      done()
    })
  })
})
