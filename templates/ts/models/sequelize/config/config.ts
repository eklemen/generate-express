import { Options, Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const envVars = process.env;

const config: Options = {
  username: envVars.USERNAME,
  password: envVars.PASSWORD,
  database: envVars.DATABASE,
  host: envVars.HOST,
  port: parseInt(envVars.DB_PORT),
  dialect: (envVars.DIALECT as Dialect),
};

type TEnvConfigs = {
  [key: string]: Options
};

const envConfigs: TEnvConfigs = {
  development: config,
  test: config,
  production: config,
};

export default envConfigs;
