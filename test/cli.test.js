const rimraf = require('rimraf');
var request = require('supertest');
const run = require('./support/inquirer-util');
const { UP, DOWN, ENTER, SPACE, npmInstall, getFiles } = run;
var AppRunner = require('./support/app-runner');


const cliPath = './bin/express-cli.js';
const ROOT_DIR = './hello-world';
const NPM_INSTALL_TIMEOUT = 300000; // 5 minutes
const APP_START_STOP_TIMEOUT = 10000;

describe('exgen cli', () => {
  afterAll( (done) => {
    jest.setTimeout(300000);
    rimraf('./hello-world', done);
  })

  describe('cli generates the application with twigs, redis and mongo mongoose', () => {
    let ctx = {
      dir: ROOT_DIR,
      files: []
    };

    it('should generate a mongoose application with twigs ', async () => {
      await generateApplication({
        db: 'mongomongoose',
        includeGitIgnore: false,
        api: 'twig',
        cache: 'redis'
      });
      ctx.files = getFiles(ROOT_DIR);
      expect(ctx.files.length).toEqual(14);
    });

    it('should contain .gitignore', ()=> {
      const filteredFile = ctx.files.filter(f => f.includes('.gitignore'));
      expect(filteredFile.length).toEqual(1);
    });

    it('should contain .env file', () => {
      const filteredFile = ctx.files.filter(f => f.includes('.env'));
      expect(filteredFile.length).toEqual(1);
    });

    it ('should contain twig files', () => {
      const filteredFile = ctx.files.filter(f => f.includes('.twig'));
      expect(filteredFile.length).toEqual(3);
    });

    it('should have installable dependencies', (done) => {
      jest.setTimeout(NPM_INSTALL_TIMEOUT);
      npmInstall(ROOT_DIR, done);
    });

    describe('npm start', function () {
      let app;
      beforeAll(() => {
        app = new AppRunner(ctx.dir);
      })

      afterAll((done) => {
        jest.setTimeout(APP_START_STOP_TIMEOUT);
        app.stop(done);
      })

      it('should start app', function (done) {
        jest.setTimeout(APP_START_STOP_TIMEOUT);
        app.start(done);
      })

      it('should respond to HTTP request for successful route', function (done) {
        request(app)
          .get('/server')
          .expect(200, /<title>Express<\/title>/, done);
      })

      it('should generate a 404 for pages that\'s not there', function (done) {
        request(app)
          .get('/notfound')
          .expect(404, /<h1>Not Found<\/h1>/, done);
      })
    })
  });
})

async function generateApplication(
  {includeGitIgnore=true,
  db, api, cache}
) {
  const outputMock = jest.fn();
  const errorMock = jest.fn();

  let actions = [ENTER, ENTER];

  if (!includeGitIgnore) actions.push("n");
  actions.push(ENTER);
  if (db) {
    const options = ['mongojs', 'mongomongoose', 'sequelize'];
    const foundIndex = options.indexOf(db);

    for (let i = 0; i <= foundIndex; i++) {
      actions.push(DOWN);
    }
  }
  actions.push(ENTER);

  if (api) {
    const apiOptions = ['dust', 'ejs', 'hbs', 'hjs', 'pug', 'twig', 'vash'];
    const foundIndex = apiOptions.indexOf(api);
    for (let i = 0; i <= foundIndex; i++) actions.push(DOWN);
  }
  actions.push(ENTER);

  if (cache) {
    if (cache === 'redis') actions.push(DOWN);
  }
  actions.push(ENTER);

  await run(`node ${cliPath}`, actions, { output: outputMock, error: errorMock });
}

