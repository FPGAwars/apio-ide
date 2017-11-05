'use babel';

//----------------------------------------------------------------------------
//--  Class for build commands implementation
//----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';


export default class BuildProvider {

  constructor(cwd) {
    this.cwd = cwd;
    console.log("New Builder!", this.cwd);
  }

  getNiceName() {
    return 'APIO';
  }

  isEligible() {
    this.files = [ 'apio.ini' ]
        .map(f => path.join(this.cwd, f))
        .filter(fs.existsSync);
    return this.files.length > 0;
  }

  settings() {
    //-- Available apio commands
    return [

      //-- APIO build
      {
        name: 'Apio: Build',
        exec: 'apio',
        args: [ 'build'],
        sh: false,
        keymap: 'ctrl-alt-b',
        atomCommandName: 'apio-ide:target:build',
        errorMatch: [
          'ERROR: Parser error in line (?<file>.+):(?<line>\\d+): syntax error'
        ]
      },

      //-- APIO Upload
      {
        name: 'Apio: Upload',
        exec: 'apio',
        args: [ 'upload'],
        sh: false,
        keymap: 'ctrl-alt-u',
        atomCommandName: 'apio-ide:target:upload'
      },

      //-- APIO Clean
      {
        name: 'Apio: Clean',
        exec: 'apio',
        args: [ 'clean'],
        sh: false,
        keymap: 'ctrl-alt-c',
        atomCommandName: 'apio-ide:target:clean'
      },

      //-- APIO Verify
      {
        name: 'Apio: Verify',
        exec: 'apio',
        args: [ 'verify'],
        sh: false,
        atomCommandName: 'apio-ide:target:verify'
      },

      //-- APIO Sim
      {
        name: 'Apio: Sim',
        exec: 'apio',
        args: [ 'sim'],
        sh: false,
        atomCommandName: 'apio-ide:target:sim'
      },

      //-- APIO Time
      {
        name: 'Apio: Time',
        exec: 'apio',
        args: [ 'time'],
        sh: false,
        atomCommandName: 'apio-ide:target:time'
      }
    ]
  }

} //-- Class
