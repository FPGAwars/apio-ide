'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

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
