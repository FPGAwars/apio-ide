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
    return [
        {
          name: 'Apio:Version',
          exec: 'apio',
          sh: true,
          args: [ '--version'],
          keymap: 'ctrl-alt-c',
          atomCommandName: 'apio:version',
        },
        {
          name: 'Apio:Build',
          exec: 'apio',
          sh: true,
          args: [ 'build'],
          keymap: 'ctrl-alt-u',
          atomCommandName: 'apio:build',
        }
    ];
    //return 'array of objects'; // [ { ... }, { ... }, ]
  }

  on(event, cb) {
    // OPTIONAL: The build provider can let `build` know when it is time to
    // refresh targets.
    return 'void';
  }

  removeAllListeners(event) {
    // OPTIONAL: (required if `on` is defined) removes all listeners registered in `on`
    return 'void';
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

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'apio-ide:toggle': () => {
        this.toggle()
      },
      'apio-ide:text': () => {
        this.text()
      },
    }));
/*
    this.subscriptions.add(atom.commands.add(
        'atom-workspace',
        'apio-ide:target:build',
        function() {
          console.log("apio-ide:build⁻-");
          atom.commands.dispatch(
            atom.views.getView(atom.workspace), 'build:trigger');
        }
    ));*/

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
  }
};
