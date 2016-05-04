'use babel';

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import { CompositeDisposable } from 'atom';

function removeChildrenOf(node) {
  if (!node) {
    return;
  }
  while(node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class BoardsSelectView {
  constructor(boards) {
    console.log(boards);

    const templateString = fs.readFileSync(
    path.resolve(__dirname, 'board-template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    // Find important nodes
    this.boardsSelect = this.element.querySelector('.boards-select');
    this.selectedBoardsUl = this.element.querySelector('.selected-boards');
    this.placeholder = this.element.querySelector('.selected-placeholder');

    // Set handlers
    this.boardsSelect.onchange = (event) => {
      console.log("BOARD SELECTED!!!!");
      //this.selectedBoards.add(event.target.value);
      //this.filterBoardsChoices();
      //this.renderSelectedBoards();
      console.log(this.boardsSelect);
      console.log(event.target.value);
      this.selectedBoards = event.target.value
      this.handleSelectBoard();
    };

    this.allBoards = {};
    this.selectedBoards = 'icezum'
    this.allBoards = clone(boards);
    console.log(this.allBoards);
    //this.filterBoardsChoices();
    this.mytest();
  }

  mytest() {
    console.log("TEST!!!!!!");
    var defaultOption = document.createElement('option');
    defaultOption.textContent = 'icezum';
    defaultOption.selected = true;
    defaultOption.disabled = false;

    var b1 = document.createElement('option');
    b1.textContent = 'icestick';
    b1.selected = false;
    b1.disabled = false;

    var b2 = document.createElement('option');
    b2.textContent = 'go-board';
    b2.selected = false;
    b2.disabled = false;



    removeChildrenOf(this.boardsSelect);
    this.boardsSelect.appendChild(defaultOption);
    this.boardsSelect.appendChild(b1);
    this.boardsSelect.appendChild(b2);
  }

  filterBoardsChoices() {
    var defaultOption = document.createElement('option');
    defaultOption.textContent = '-- choose a board (one at a time) --';
    defaultOption.selected = true;
    defaultOption.disabled = true;

    // Sort boards by name
    const sortedKeys = Object.keys(this.allBoards).sort((a, b) => {
      if (this.allBoards[a].name > this.allBoards[b].name) {
        return 1;
      } else if (this.allBoards[a].name < this.allBoards[b].name) {
        return -1;
      } else {
        return 0;
      }
    });

    const groups = {};
    for (const boardId of sortedKeys) {
      const board = this.allBoards[boardId];

      // Hide already selected boards
      if (this.selectedBoards.has(boardId)) {
        continue;
      }

      if (!groups.hasOwnProperty(board.vendor)) {
        groups[board.vendor] = document.createElement('optgroup');
        groups[board.vendor].label = board.vendor;
      }

      const option = document.createElement('option');
      option.value = boardId;
      option.textContent = board.name;
      groups[board.vendor].appendChild(option);
    }

    removeChildrenOf(this.boardsSelect);
    this.boardsSelect.appendChild(defaultOption);
    const vendorNames = Object.keys(groups).sort();
    for (let i = 0; i < vendorNames.length; i++) {
      this.boardsSelect.appendChild(groups[vendorNames[i]]);
    }
  }

  renderSelectedBoards() {
    this.checkPlaceholderAndUlVisibility();
    removeChildrenOf(this.selectedBoardsUl);
    this.selectedBoards.forEach((boardId) => {
      this.selectedBoardsUl.appendChild(this.createSelected(boardId));
    });
  }

  checkPlaceholderAndUlVisibility() {
    if (this.selectedBoards.length < 1) {
      this.placeholder.style.display = 'block';
      this.selectedBoardsUl.style.display = 'none';
    } else {
      this.placeholder.style.display = 'none';
      this.selectedBoardsUl.style.display = 'block';
    }
  }



  handleSelectBoard() {}

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }

}

class NewProjectView {

    constructor() {

      console.log("New Project Class!!!");
      const templateString = fs.readFileSync(
          path.resolve(__dirname, 'template.html'),
          {encoding: 'utf-8'});
      //console.log(templateString);
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateString, 'text/html');
      this.element = doc.querySelector('.pio-template-root').cloneNode(true);

      // Find important nodes
      this.boardsSelectWrapper = this.element.querySelector('.boards-select-wrapper');
      this.directorySelect = this.element.querySelector('.directory-select');
      this.otherDirectoryButton = this.element.querySelector('.other-directory');
      this.doInitButton = this.element.querySelector('.controls .do-init');
      this.cancelButton = this.element.querySelector('.controls .cancel');
      this.commandStatusWrapper = this.element.querySelector('.command-status');
      this.commandStatusContent = this.commandStatusWrapper.querySelector('.content');
      this.commandStatusSpinner = this.commandStatusWrapper.querySelector('.icon');

      // Set handlers
      this.otherDirectoryButton.onclick = () => {
        atom.pickFolder((selectedPaths) => {
          if (!selectedPaths) {
            return;
          }
          this.addDirectories(selectedPaths);
          this.directorySelect.value = selectedPaths[selectedPaths.length - 1];
          //this.updateInitButtonDisabled();
          this.doInitButton.disabled = false;
        });
      };

      this.doInitButton.onclick = () => {
        console.log("Constructor: INIT--------");
        this.doInitButton.textContent = 'Initializing...';
        //this.doInitButton.disabled = true;
        this.handleInit();
      };

      this.cancelButton.onclick = () => this.handleCancel();


      const boards = ['icestick','icezum','go-board'];
      removeChildrenOf(this.boardsSelectWrapper);
      this.boardsSelect = new BoardsSelectView(boards);
      this.boardsSelectWrapper.appendChild(this.boardsSelect.getElement());
      this.boardsSelect.handleSelectBoard = () => this.updateInitButtonDisabled();


    } //-- End constructor

    updateInitButtonDisabled() {
      const directorySelected = this.directorySelect.value.toString().length > 0;
      this.doInitButton.disabled = !directorySelected;
    }

    addDirectories(directories) {
      for (const dir of directories) {
        const option = document.createElement('option');
        option.value = dir;
        option.textContent = dir;
        this.directorySelect.appendChild(option);
      }
    }

    handleInit() {}
    handleCancel() {}

    getElement() {
      return this.element;
    }

    getDirectory() {
      return this.directorySelect.value;
    }

    getBoard() {
      return this.boardsSelect.selectedBoards;
    }

    destroy() {
      this.element.remove();
    }

} //-- End class



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
      'apio:init': () => {
        this.initProject()
      }
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

  initProject() {
    console.log("New project!!!!")
    var view = new NewProjectView();
    var panel = atom.workspace.addModalPanel({item: view.getElement()});

    // Set buttons handlers
    view.handleCancel = () => {
      console.log("CANCEL!!!!");
      panel.destroy();
    }

    view.handleInit = () => {
      console.log("INIT!!!! apio init --board icezum");
      //-- Invocar comando:  'apio:version' para probar

      const projectPath = view.getDirectory();
      const board = view.getBoard();
      console.log("PATH:");
      console.log(projectPath);

      console.log('Board:');
      console.log(board);

      const args = ['init', '--board'];
      args.push(board)
      args.push('--project-dir');
      args.push(projectPath);

      spawnAPio(args);

      atom.project.addPath(projectPath);
      panel.destroy();
    }
  },

  //-- Add commands to the toolbar
  consumeToolBar: function(toolBar) {
      this.toolBar = toolBar('Apio-ide');

      //-- APIO init (New project)
      this.toolBar.addButton({
        icon: 'file-code',
        //iconset: 'fa',
        callback: 'apio:init',
        tooltip: 'Apio: Init'
      });

      this.toolBar.addSpacer();

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

function spawnAPio(args) {
  return new Promise((resolve, reject) => {
    let stdout = '', stderr = '';
    const child = child_process.spawn('apio', args);
    var text = String('');
    child.stdout.on('data', chunk => {
      text += chunk;
      console.log("Data!!!!!!!!!!!!!!!!!!!!");
      console.log(text)
    });
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (0 !== code) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}
