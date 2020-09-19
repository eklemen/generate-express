var kebabCase = require('lodash.kebabcase')
var sortedObject = require('sorted-object')

const tsBase = {
  '@types/compression': '^1.7.0',
  '@types/cookie-parser': '1.4.2',
  '@types/cors': '^2.8.6',
  '@types/debug': '^4.1.5',
  '@types/express': '^4.17.6',
  '@types/helmet': '0.0.47',
  '@types/morgan': '^1.9.1',
  'tslib': '^2.0.0',
  'typescript': '^3.9.5',
  'dotenv': '^8.2.0'
}

const jsBase = {
  'babel-plugin-inline-dotenv': '^1.5.0',
  '@babel/cli': '^7.8.4',
  '@babel/core': '^7.9.0',
  '@babel/node': '^7.8.7',
  '@babel/preset-env': '^7.9.0'
}

const middlewares = {
  'morgan': '^1.9.1',
  'cookie-parser': '^1.4.4',
  'helmet': '^3.22.0',
  'cors': '^2.8.5',
  'compression': '^1.7.4'
}

class Pkg {
  constructor ({ name, hasTs, hasView, program }) {
    // base deps
    this.base = {
      name: kebabCase(name),
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
        // TODO add env support for TS
        'debug': '~2.6.9',
        'express': '~4.16.1'
      },
      devDependencies: {
        'jest': '^25.2.7',
        'npm-run-all': '^4.1.5',
        'rimraf': '^3.0.2',
        'nodemon': '^2.0.3'
      }
    }
    this.hasTs = hasTs
    this.hasView = hasView
    this.tsBase = tsBase
    this.jsBase = jsBase
    this.db = program.database
    this.cache = program.cache !== 'none'
    this.view = program.view
    this.middlewares = middlewares
  }
  get package () {
    // sort dependencies like npm
    this.base.dependencies = sortedObject(this.base.dependencies)
    this.base.devDependencies = sortedObject(this.base.devDependencies)
    return this.base
  }
  init () {
    this
      .addTranspiler()
      .addLanguageDevDeps()
      .addMiddlewares()
      .addDb()
      .addCache()
      .addLint()
      .addView()
    return this
  }
  addTranspiler () {
    const { scripts, nodemonConfig } = this.base
    if (this.hasTs) {
      scripts.transpile = 'tsc'
      nodemonConfig.ext = 'ts'
    } else {
      scripts.transpile = 'babel ./server --out-dir dist --copy-files'
    }
    return this
  }
  addLanguageDevDeps () {
    if (this.hasTs) {
      this.addBaseTypescript()
    } else {
      this.addBaseJavascript()
    }
    return this
  }
  addBaseTypescript () {
    this.base.devDependencies = {
      ...this.base.devDependencies,
      ...this.tsBase
    }
    this.hasTs = true
    return this
  }
  addBaseJavascript () {
    this.base.devDependencies = {
      ...this.base.devDependencies,
      ...this.jsBase
    }
    return this
  }
  addMiddlewares () {
    this.base.dependencies = {
      ...this.base.dependencies,
      ...this.middlewares
    }
    return this
  }
  addDb () {
    switch (this.db) {
      case 'mongojs':
        this.base.dependencies.mongojs = '^3.1.0'
        if (this.hasTs) {
          this.base.devDependencies['@types/mongojs'] = '^4.1.5'
        }
        break
      case 'sequelize':
        this.base.dependencies.mysql2 = '^1.6.4'
        // downgraded from v6 due to bugs
        this.base.dependencies.sequelize = '^5.x'
        if (this.hasTs) {
          this.base.devDependencies['@types/sequelize'] = '^4.28.9'
        }
        break
      case 'mongo + mongoose':
        this.base.dependencies.mongoose = '^5.3.16'
        if (this.hasTs) {
          this.base.devDependencies['@types/mongoose'] = '^5.7.24'
        }
        break
    }
    return this
  }
  addCache () {
    if (this.cache) {
      this.base.dependencies.redis = '^3.0.2'
      if (this.hasTs) {
        this.base.devDependencies['@types/redis'] = '^2.8.27'
      }
    }
    return this
  }
  // TODO: make this configurable via inquirer
  // TODO: add option to auto-fix on save via nodemon
  addLint () {
    this.base.devDependencies.eslint = '^7.9.0'
    this.base.devDependencies['eslint-config-airbnb-base'] = '^14.2.0'
    this.base.devDependencies['eslint-plugin-import'] = '^2.22.0'
    this.base.scripts.lint = 'eslint ./server'
    if (this.hasTs) {
      this.base.devDependencies['@typescript-eslint/eslint-plugin'] = '^4.1.1'
      this.base.devDependencies['@typescript-eslint/parser'] = '^4.1.1'
      this.base.devDependencies['eslint-config-airbnb-typescript'] = '^10.0.0'
    }
    return this
  }
  addView () {
    if (this.hasView) {
      this.base.dependencies['http-errors'] = '~1.6.3'
    }
    switch (this.view) {
      case 'dust':
        this.base.dependencies.adaro = '~1.0.4'
        break
      case 'ejs':
        this.base.dependencies.ejs = '~2.6.1'
        break
      case 'hbs':
        this.base.dependencies.hbs = '~4.0.4'
        break
      case 'hjs':
        this.base.dependencies.hjs = '~0.0.6'
        break
      case 'jade':
        this.base.dependencies.jade = '~1.11.0'
        break
      case 'pug':
        this.base.dependencies.pug = '2.0.0-beta11'
        break
      case 'twig':
        this.base.dependencies.twig = '~0.10.3'
        break
      case 'vash':
        this.base.dependencies.vash = '~0.12.6'
        break
    }
    return this
  }
}

module.exports = Pkg
