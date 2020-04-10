'use strict'

import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import dotenv from 'dotenv'
const basename = path.basename(module.filename)
dotenv.config()
const envVars = process.env

const config = {
  username: envVars.USERNAME,
  password: envVars.PASSWORD,
  database: envVars.DATABASE,
  host: envVars.HOST,
  port: envVars.DB_PORT,
  dialect: envVars.DIALECT
}

const sequelize = new Sequelize(envVars.database, envVars.username, envVars.password, config)

const db = {}

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(function (file) {
    var model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db
