const path = require('path')
const tools = require('./tools')

class Scaffold {
  constructor ({ hasTs, dir, directory, tsjs }) {
    this.hasTs = hasTs
    this.dir = dir
    this.directory = directory
    this.tsjs = tsjs
  }
  init () {
    if (this.directory !== '.') {
      tools.mkdir(this.directory, '.')
    }
    return this
  }
  createCoreFiles (packagejson) {
    // write files
    if (this.hasTs) {
      tools.copyTemplate('ts/tsconfig.json', path.join(this.dir, 'tsconfig.json'))
    } else {
      tools.copyTemplate('js/babelrc', path.join(this.dir, '.babelrc'))
    }
    tools.mkdir(this.dir, 'server/bin')
    tools.copyTemplate(`${this.tsjs}/eslintrc.js`, path.join(this.dir, '.eslintrc.js'))
    tools.write(path.join(this.dir, 'package.json'), JSON.stringify(packagejson, null, 2) + '\n')
    return this
  }
  createRouteFiles () {
    // copy route templates
    tools.mkdir(this.directory, 'server/routes')
    tools.copyTemplate(`${this.tsjs}/routes/users.${this.tsjs}`, path.join(this.dir, `/server/routes/users.${this.tsjs}`))
    tools.copyTemplate(`${this.tsjs}/routes/index.${this.tsjs}`, path.join(this.dir, `/server/routes/index.${this.tsjs}`))
    tools.copyTemplate(`${this.tsjs}/routes/hello.${this.tsjs}`, path.join(this.dir, `/server/routes/hello.${this.tsjs}`))
    return this
  }
  createDefaultControllerFiles () {
    tools.copyTemplate(`${this.tsjs}/controllers/userController.default.${this.tsjs}`, path.join(this.dir, `/server/controllers/userController.${this.tsjs}`))
    return this
  }
  createMongooseFiles () {
    tools.mkdir(this.dir, 'server/models')
    tools.copyTemplateMulti(`${this.tsjs}/models/mongoose`, `${this.dir}/server/models`, `*.${this.tsjs}`)
    tools.copyTemplate(`${this.tsjs}/controllers/userController.mongo.${this.tsjs}`, path.join(this.dir, `/server/controllers/userController.${this.tsjs}`))
    return this
  }
  createSequelizeFiles () {
    tools.mkdir(this.dir, 'server/config')
    tools.copyTemplateMulti(`${this.tsjs}/models/sequelize/config`, `${this.dir}/server/config`, `*.${this.tsjs}`)
    tools.mkdir(this.dir, 'server/models')
    tools.copyTemplateMulti(`${this.tsjs}/models/sequelize`, `${this.dir}/server/models`, `*.${this.tsjs}`)
    tools.copyTemplate(`${this.tsjs}/controllers/userController.sql.${this.tsjs}`, path.join(this.dir, `/server/controllers/userController.${this.tsjs}`))
    return this
  }
  createGitIgnore (shouldCreate) {
    if (shouldCreate) {
      tools.copyTemplate(`${this.tsjs}/gitignore`, path.join(this.dir, '.gitignore'))
    }
    return this
  }
  createTestingFiles (db) {
    if (!this.hasTs) {
      tools.mkdir(this.dir, 'tests/routes')
      if (db === 'mongoose') {
        tools.copyTemplate(`${this.tsjs}/testFiles/mongo/hello.js`, path.join(this.dir, 'tests/routes/hello.spec.js'))
        tools.copyTemplate(`${this.tsjs}/testFiles/mongo/users.js`, path.join(this.dir, 'tests/routes/users.spec.js'))
      }
      tools.copyTemplate(`${this.tsjs}/jestConfig.${this.tsjs}`, path.join(this.dir, `jest.config.js`))
    }
    return this
  }
}

module.exports = Scaffold
