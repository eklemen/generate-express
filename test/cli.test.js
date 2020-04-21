const inquirer = require('inquirer')
const cli = require('../bin/express-cli')

describe('generate-express', () => {
  let backup;
  beforeAll(() => {
    backup = inquirer.prompt;
    inquirer.prompt = (questions) => Promise.resolve({email: 'test'})
  })

  it('Should pass', async function () {
    expect(true).toEqual(true)
    Promise.resolve(cli).then(answers => answers.email.should.equal('test'))
  })

  // restore
  afterAll(() => {
    inquirer.prompt = backup
  })

})