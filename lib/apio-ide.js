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
        //-- APIO version
        {
          name: 'Apio:Version',
          exec: 'apio',
          sh: false,
          args: [ '--version'],
          keymap: 'ctrl-alt-c',
          atomCommandName: 'apio:version',
        },

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
        }
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

      this.toolBar.addButton({
        icon: 'arrow-right',
        callback: 'apio:upload',
        tooltip: 'Apio: Upload'
      });

      this.toolBar.addButton({
        icon: 'arrow-right',
        callback: 'apio:version',
        tooltip: 'Apio: Version'
      });


      this.toolBar.addSpacer();
  }

};
