import dotenv from 'dotenv';
dotenv.config();

const envVars = process.env;

const config = {
  username: envVars.USERNAME,
  password: envVars.PASSWORD,
  database: envVars.DATABASE,
  host: envVars.HOST,
  port: envVars.DB_PORT,
  dialect: envVars.DIALECT,
};

export default {
  development: config,
  test: config,
  production: config,
};
