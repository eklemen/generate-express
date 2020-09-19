const config = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DIALECT,
};

export default {
  development: config,
  test: config,
  production: config,
};
