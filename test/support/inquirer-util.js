const { writeFileSync, unlinkSync } = require('fs');
const child_process = require('child_process');
const fs = require('fs');
var exec = require('child_process').exec;

const TEMP_FILE_PATH = "/tmp/";

module.exports = async function (
  command,
  inputs,
  { output, error },
  { timeout, nodeScript, nodeCommand } = {
    timeout: 100,
    nodeScript: false,
    nodeCommand: "node"
  }
) {
  return new Promise(async resolve => {
    let proc;
    let tmpFile = `${TEMP_FILE_PATH}${Math.random()}.js`;

    if (nodeScript) {
      writeFileSync(tmpFile, command);
      proc = child_process.exec(`${nodeCommand} ${tmpFile}`);
    } else {
      proc = child_process.exec(command);
    }

    proc.stdout.on("data", data => {
      output(data);
    });

    proc.stderr.on("data", data => {
      error(data);
    });

    const sendKeys = async inputs => {
      await inputs.reduce(
        (previousPromise, input) =>
          new Promise(async resolve => {
            if (previousPromise) {
              await previousPromise;
            }

            setTimeout(() => {
              proc.stdin.write(input);
              resolve();
            }, timeout);
          }),
        null
      );

      proc.stdin.end();
    };

    await sendKeys(inputs);
    proc.on("exit", code => {
      if (nodeScript) {
        unlinkSync(tmpFile);
      }
      resolve(code);
    });
  });
}

function getFiles (dir, files_){
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (var i in files){
      const name = dir + '/' + files[i];
      const actualName = '/' + files[i]
      if (fs.statSync(name).isDirectory()){
          getFiles(name, files_);
      } else {
          files_.push(actualName);
      }
  }
  return files_;
}

function npmInstall (dir, callback) {
  exec('npm install', { cwd: dir }, function (err, stderr) {
    if (err) {
      err.message += stderr;
      callback(err);
      return;
    }

    callback();
  })
}

// https://www.tldp.org/LDP/abs/html/escapingsection.html
module.exports.DOWN = "\x1B\x5B\x42";
module.exports.UP = "\x1B\x5B\x41";
module.exports.ENTER = "\x0D";
module.exports.SPACE = "\x20";
module.exports.getFiles = getFiles;
module.exports.npmInstall = npmInstall;
