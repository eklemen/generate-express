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
  beforeEach(() => {
    pkg = new Package({
      name: 'test-app',
      hasTs: false,
      program
    })
  })
  describe('Class default values', () => {
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

  describe('class methods', () => {
    beforeEach(() => {
      jest.mock('../../utils/Package')
      pkg = new Package({
        name: 'test-app',
        hasTs: false,
        program
      })
    })
    test('init()', (done) => {
      Package.prototype.addTranspiler = jest.fn().mockReturnValue(pkg)
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
      done()
    })
  })
})
