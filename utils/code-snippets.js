
const codeSnippets = {
  mongoJsCode:
`const dbUri = process.env.MONGODB_URI || 'mydb';
const collections = ['mycollection'];

// eslint-disable-next-line
const db = mongojs(dbUri, collections);`,

  sequelizeCode:
`// Run sequelize before listen
db.sequelize.sync({ force: true }).then(() => {
  app.listen(port, () => {
    console.log(\`App listening on PORT \${port}\`);
  });
});`,
  sequelizeCodeTS:
    `// Run sequelize before listen
db.sync({ force: true }).then(() => {
  app.listen(port, () => {
    console.log(\`App listening on PORT \${port}\`);
  });
});`,

  sequelizeEnvironmentVars:
`USERNAME=root
PASSWORD=null
DATABASE=database_dev
HOST=127.0.0.1
DB_PORT=3306
DIALECT=mysql`,
  sequelizeEnvVars: {
    MySQL:
`USERNAME=root
PASSWORD=null
DATABASE=database_dev
HOST=127.0.0.1
DB_PORT=3306
DIALECT=mysql`,
    Postgres:
`USERNAME=root
PASSWORD=null
DATABASE=database_dev
HOST=127.0.0.1
DB_PORT=5432
DIALECT=postgres`,
    MariaDB:
`USERNAME=root
PASSWORD=null
DATABASE=database_dev
HOST=127.0.0.1
DB_PORT=3306
DIALECT=mariadb`
  },

  mongoMongooseCode:
`const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/mydb';
const mongooseConfigs = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(mongoUri, mongooseConfigs);`,

  redisCode:
`/**
* Redis Setup. For more options for redis client, go to: https://www.npmjs.com/package/redis#options-object-properties
*/
const redisPort = parseInt(process.env.REDIS_PORT) || 6379;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisClient = redis.createClient(redisPort, redisHost);

redisClient.on('error', (error) => {
  console.error(error);
  console.log('\x1b[33m%s\x1b[0m', 'Make sure redis is installed and running.');
});

redisClient.on('connect', () => {
  console.log(\`Redis connected in port: \${redisPort}\`);
});
// --------------End of Redis Setup-----------------------`,

  redisEnvironmentVars:
`REDIS_PORT=6379
REDIS_HOST=127.0.0.1`
}

module.exports = codeSnippets
