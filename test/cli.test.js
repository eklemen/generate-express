const inquirer = require('inquirer')
const { stdin } = require('mock-stdin')
let path = require('path')
let exec = require('child_process').exec
// test('Code should be 0', async () => {
//
// })

function cli(args, cwd) {
  return new Promise(resolve => {
    exec(`node ${path.resolve('./bin/express-cli.js')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr
        })
      })
  })
}

describe('generate-express', () => {
  let io = null
  beforeAll(() => (io = stdin()))
  afterAll(() => io.restore())

  it('Should pass', async (done) => {
    expect(true).toEqual(true)
    let result = await  cli(['deleteme'], '.')
    expect(result).toBe(0)
    // Promise.resolve(cli).then(() => {
    //   console.log('done')
    // })
    // Promise.resolve(cli()).then(answers => {
    //   expect(answers.email).toEqual('test')
    // })
  })

})