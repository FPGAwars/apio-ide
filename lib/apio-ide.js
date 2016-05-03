'use babel';

import { CompositeDisposable } from 'atom';

class ApioBuildProvider {

  constructor(cwd) {
    console.log("APIOBuildProvider.....");
    this.cwd = cwd;
    this.title = 'APIO';
  }

  destructor() {
    // OPTIONAL: tear down here.
    // destructor is not part of ES6. This is called by `build` like any
    // other method before deactivating.
    return 'void';
  }

  getNiceName() {
    // REQUIRED: return a nice readable name of this provider.
    return this.title;
  }

  isEligible() {
    // REQUIRED: Perform operations to determine if this build provider can
    // build the project in `cwd` (which was specified in `constructor`).
    return true;
  }

  settings() {
    console.log("Setting.....");

    const errorMatch = [
         'ERROR: Parser error in line (?<file>.+):(?<line>\\d+): syntax error',
      ];

    //-- Available apio commands
    return [

        //-- APIO build
        {
          name: 'Apio:Build',
          exec: 'apio',
          sh: false,
          args: [ 'build'],
          keymap: 'ctrl-alt-b',
          atomCommandName: 'apio:build',
          errorMatch: errorMatch
        },

        //-- APIO upload
        {
          name: 'Apio:Upload',
          exec: 'apio',
          sh: false,
          args: [ 'upload'],
          keymap: 'ctrl-alt-u',
          atomCommandName: 'apio:upload',
          //errorMatch: errorMatch
        },

        //-- APIO Clean
        {
          name: 'Apio:Clean',
          exec: 'apio',
          sh: false,
          args: [ 'clean'],
          keymap: 'ctrl-alt-c',
          atomCommandName: 'apio:clean',
          //errorMatch: errorMatch
        },

        //-- APIO sim
        {
          name: 'Apio:Sim',
          exec: 'apio',
          sh: false,
          args: [ 'sim'],
          //keymap: 'ctrl-alt-c',
          atomCommandName: 'apio:sim',
          //errorMatch: errorMatch
        },

        //-- APIO time
        {
          name: 'Apio:Time',
          exec: 'apio',
          sh: false,
          args: [ 'time'],
          //keymap: 'ctrl-alt-c',
          atomCommandName: 'apio:time',
          //errorMatch: errorMatch
        },

        //-- APIO version
        {
          name: 'Apio:Version',
          exec: 'apio',
          sh: false,
          args: [ '--version'],
          keymap: 'ctrl-alt-v',
          atomCommandName: 'apio:version',
        },


    ];
    //return 'array of objects'; // [ { ... }, { ... }, ]
  }
}

export default {

  subscriptions: null,


  provideBuilder: function() {
    return ApioBuildProvider;
  },


  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Commnad implementation
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'apio-ide:toggle': () => {
        this.toggle()
      },
      'apio-ide:text': () => {
        this.text()
      },
    }));

  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
  },

  toggle() {
    console.log('ApioIde was toggled!-----');
  },

  text() {
    console.log('Text!!!!');
    if (editor = atom.workspace.getActiveTextEditor())
      editor.insertText('Hello, World!')
  },

  //-- Add commands to the toolbar
  consumeToolBar: function(toolBar) {
      this.toolBar = toolBar('Apio-ide');

      //-- APIO Build
      this.toolBar.addButton({
        icon: 'check',
        callback: 'apio:build',
        tooltip: 'Apio: Build'
      });


      //-- APIO upload
      this.toolBar.addButton({
        //icon: 'arrow-right',
        icon: 'upload',
        iconset: 'fa',
        callback: 'apio:upload',
        tooltip: 'Apio: Upload'
      });

      //-- Apio clean
      this.toolBar.addButton({
        icon: 'trashcan',
        callback: 'apio:clean',
        tooltip: 'Apio: Clean'
      });


      this.toolBar.addSpacer();

      //-- Apio sim
      this.toolBar.addButton({
        icon: 'ios-pulse-strong',
        iconset: 'ion',
        callback: 'apio:sim',
        tooltip: 'Apio: Simulation'
      });

      //-- Apio time
      this.toolBar.addButton({
        icon: 'clock-o',
        iconset: 'fa',
        callback: 'apio:time',
        tooltip: 'Apio: Time'
      });

      this.toolBar.addSpacer();

  }

};
