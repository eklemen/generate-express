const inquirer = require('inquirer')
const cli = require('../bin/express-cli')

describe('generate-express', () => {
  let backup
  beforeAll(() => {
    backup = inquirer.prompt
    process.argv.push('deleteme')
    inquirer.prompt = (questions) => Promise.resolve({email: 'test'})
  })

  it('Should pass', function () {
    expect(true).toEqual(true)
    Promise.resolve(cli()).then(answers => {
      expect(answers.email).toEqual('test')
    })
  })

  // restore
  afterAll(() => {
    inquirer.prompt = backup
  })

})