'use babel';

import path from 'path';
import shell from 'shell';
import child_process from 'child_process';


//-- Execute an apio command
//-- args: array of string with the parameters
export function spawnApio(args) {
  return new Promise((resolve, reject) => {

    let stdout = '', stderr = '';

    //-- Execute the command
    const child = child_process.spawn('apio', args);

    //-- Get the command output
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (0 !== code) {
        reject(stderr);
        console.log(stderr);
      } else {
        resolve(stdout);
        console.log(stdout);
      }
    });
  });
}


export function handleCustomPath(newValue, oldValue) {
  if (oldValue) {
    process.env.PATH = process.env.PATH.replace(oldValue + path.delimiter, '');
    process.env.PATH = process.env.PATH.replace(path.delimiter + oldValue, '');
  }
  if (newValue && process.env.PATH.indexOf(newValue) < 0) {
    process.env.PATH = newValue + path.delimiter + process.env.PATH;
  }
}

export function showVersion() {
  const args = ['--version'];

  //-- Call apio
  spawnApio(args)
  .then((stdout) => atom.notifications.addInfo(stdout))
  .catch((stderr) => atom.notifications.addWarning(stderr));
}

export function checkVersion(min, max) {
  const args = ['--version'];

  return new Promise((resolve, reject) => {
    //-- Call apio
    spawnApio(args)
    .then((stdout) => {
      const version = stdout.match(/apio,\sversion\s(.+)/i)[1];
      if (version >= min && version < max) {
        resolve();
      }
      else {
        reject();
      }
    })
    .catch((stderr) => {
      atom.notifications.addWarning(stderr)
      reject();
    });
  });
}

export function openUrl(url) {
  return shell.openExternal(url);
}
