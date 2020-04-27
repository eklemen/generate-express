const inquirer = require('inquirer')
const { stdin } = require('mock-stdin')
let path = require('path')
let exec = require('child_process').exec
// test('Code should be 0', async () => {
//
// })
// function cli(args, cwd) {
//   return new Promise(resolve => {
//     exec(`node ${path.resolve('./bin/express-cli.js')} ${args.join(' ')}`,
//       { cwd },
//       (error, stdout, stderr) => {
//         resolve({
//           code: error && error.code ? error.code : 0,
//           error,
//           stdout,
//           stderr
//         })
//       })
//   })
// }
// Key codes
const keys = {
  up: '\x1B\x5B\x41',
  down: '\x1B\x5B\x42',
  enter: '\x0D',
  space: '\x20'
}

const cli = () => require('../bin/express-cli')

describe('generate-express', () => {
  let io = null
  beforeAll((done) => {
    io = stdin()
    done()
  })
  afterAll((done) => {
    io.restore()
    done()
  })

  it('Should pass', async (done) => {
    // expect(true).toEqual(true)
    // let result = await  cli(['deleteme'], '.')
    // expect(result).toBe(0)
    inquirer.prompt = jest.fn().mockResolvedValue({
      dir: 'deleteme',
      gitignore: true,
      database: 'none',
      view: 'none',
      cache: 'none'
    })
    Promise.resolve(exec(`node ${path.resolve('./bin/express-cli.js')} deleteme`)).then(r => {
      console.log('r=--------', r)
    })
    // Promise.resolve(cli).then(() => {
    //   console.log('done')
    // })
    // Promise.resolve(cli()).then(answers => {
    //   expect(answers.email).toEqual('test')
    // })
    done()
  })
})
