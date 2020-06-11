
const codeSnippets = {
  mongoJsCode:
`const dbUri = process.env.MONGODB_URI || 'mydb';
const collections = ['mycollection'];

const db = mongojs(dbUri, collections);`,

  sequelizeCode:
`// Run sequelize before listen
db.sequelize.sync({ force: true }).then(function() {
    app.listen(port, function() {
    console.log("App listening on PORT " + port);
    });
});`,

  sequelizeEnvironmentVars:
`USERNAME=root
PASSWORD=null
DATABASE=database_dev
HOST=127.0.0.1
DB_PORT=3306
DIALECT=mysql`,

  mongoMongooseCode:
`const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/mydb';
const mongooseConfigs = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(mongoUri, mongooseConfigs);`,

  redisCode:
`/**
* Redis Setup. For more options for redis client, go to: https://www.npmjs.com/package/redis#options-object-properties
*/
const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisClient = redis.createClient(redisPort, redisHost);

redisClient.on("error", (error) =>  {
 console.error(error);
});

redisClient.on('connect', () => {
 console.log(\`Redis connected in port: \${redisPort}\`)
})
// --------------End of Redis Setup-----------------------`,

  redisEnvironmentVars:
`REDIS_PORT=6379
REDIS_HOST=127.0.0.1`
}

const pkg = {
  version: '1.0.0',
  private: true,
  main: 'dist/bin/www.js',
  scripts: {
    'start': 'nodemon',
    'build': 'npm-run-all clean transpile',
    'server': 'node ./dist/bin/www',
    'dev': 'NODE_ENV=development npm-run-all build server',
    'prod': 'NODE_ENV=production npm-run-all build server',
    // 'transpile': 'babel ./server --out-dir dist --copy-files',
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
    // 'babel-plugin-inline-dotenv': '^1.5.0',
    'debug': '~2.6.9',
    'express': '~4.16.1'
  },
  devDependencies: {
    // '@babel/cli': '^7.8.4',
    // '@babel/core': '^7.9.0',
    // '@babel/node': '^7.8.7',
    // '@babel/preset-env': '^7.9.0',
    'jest': '^25.2.7',
    'npm-run-all': '^4.1.5',
    'rimraf': '^3.0.2',
    'nodemon': '^2.0.3'
  }
}
codeSnippets.pkg = pkg

module.exports = codeSnippets
