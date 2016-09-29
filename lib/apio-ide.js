'use babel';
//-- https://babeljs.io/

//--------------------------------------------------------------------------
//-- APIO-IDE main file
//-- (c) FPGAwars
//--     Juan Gonzalez-Gomez (Obijuan) (May, 2016)
//--     Jesús Arroyo Torrens (Sep, 2016)
//-- derived from the Platformio-ide
//---------------------------------------------------------------------------
//-- GPL LICENSE
//---------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import shell from 'shell';
import config from './config';
import child_process from 'child_process';
import { CompositeDisposable } from 'atom';

//-------------- ENTRY POINT -----------------------------------------------
//-- This class implements the atom apio commands, the toolbar and the
//--   build commands
//--
//-- Interface methods:
//--
//-- activate():  It is called When the apio-ide package is enabled
//--
//-- provideBuild(): It returns the class for managing the build
//--  It implements all the apio-ide building methods
//--
//-- The consumeToolBar method is a callback for the tool-bar package
//--   It is called when the toolbar is activated
//--
//--------------------------------------------------------------------
//--  Apio ide commands:
//--
//--  * apio:init:  Opens and manages the new project panel
//--
//--  * apio-ide:test: Insert the text " Open FPGAs power in the current file"
//--     It is just for testing (and fun!!)
//--
//--  * apio:verify: Execute apio verify
//--
//--  * apio:build: Execute apio build
//--
//--  * apio:upload: Execute apio upload
//--
//--  * apio:clean: Execute apio clean
//--
//--  * apio:sim: Execute apio sim
//--
//--  * apio:time: Execute apio time
//--
//----------------------------------------------------------------------------

export default {
  config: config,
  subscriptions: null,

  //-- Build atom package entry point. It returns the class for managing
  //-- the apio-ide builds (All the apio-ide build commands are provide
  //--  there)
  provideBuilder: function() {
    return ApioBuildProvider;
  },

  //-- Apio-ide entry point. When the package is enabled, it will be called
  //-- when atom is ready
  activate(state) {
    this.handleCustomPATH(atom.config.get('apio-ide.customPATH'));
    this.subscriptions = new CompositeDisposable();
    this.setupCommands()
  },

  setupCommands: function() {

    //-- Apio-ide Commnad implementation
    this.subscriptions.add(atom.commands.add('atom-workspace', {

      //-- This command is just for debugging
      'apio-ide:test': () => {
        this.test()
      },

      //-- NEW PROJECT command. It opens and manages the new project panel
      'apio:init': () => {
        this.initProject()
      },

      //-------------------- Examples!! -----------------------------
      //-- Led example
      'apio:example_leds': (event) => {
        console.log("Event: leds");
        this.examples('leds')
      },

      //--------------  Constraint files ------------------------------
      //-- Icezum contraint file
      'apio:example_icezum': (event) => {
        console.log("Event: Icezum pcf");
        this.examples('icezum')
      },

      //-- Icestick contraint file
      'apio:example_icestick': (event) => {
        this.examples('icestick')
      },

      //-- Go board contraint file
      'apio:example_go_board': (event) => {
        this.examples('go-board')
      },

      //----------------- Templates ---------------------------------------
      //-- Icestick template
      'apio:example_icestick_template': (event) => {
        this.examples('icestick-template')
      },

      //-- Iceszum template
      'apio:example_icezum_template': (event) => {
        this.examples('icezum-template')
      },

      //-- Go-board template
      'apio:example_go_board_template': (event) => {
        this.examples('go-board-template')
      },

      'apio:example_wire': (event) => {
        this.examples('wire')
      },

      'apio:example_go_board_leds': (event) => {
        this.examples('go-board-leds')
      },

      'apio:pinout-icestick':
        () => shell.openExternal('http://www.pighixxx.com/test/2016/02/icestick-pinout/'),

      'apio:pinout-icezum':
        () => shell.openExternal('http://www.pighixxx.com/test/2016/05/icezum-pinout/'),

      'apio:pinout-go-board':
        () => shell.openExternal('https://www.nandland.com/goboard/images/Go_Board_V1.pdf'),

    }));

    this.subscriptions.add(
      atom.config.onDidChange('apio-ide.customPATH', (event) => {
        this.handleCustomPATH(event.newValue, event.oldValue);
      })
    );

  },

  handleCustomPATH: function(newValue, oldValue) {
    if (oldValue) {
      process.env.PATH = process.env.PATH.replace(oldValue + path.delimiter, '');
      process.env.PATH = process.env.PATH.replace(path.delimiter + oldValue, '');
    }
    if (newValue && process.env.PATH.indexOf(newValue) < 0) {
      process.env.PATH = newValue + path.delimiter + process.env.PATH;
    }
  },

  //-- Apio-ide exit point. When the package is disabled, it will be called
  //-- when atom is ready
  deactivate: function() {
    this.subscriptions.dispose();
    if (this.toolBar) {
      this.toolBar.removeItems();
      this.toolBar = null;
    }
  },

  //-- Entry point: Toolbar.  It is called by the toolbar package
  //-- It creates the apio-ide toolbar buttons
  consumeToolBar: function(toolBar) {
      this.toolBar = toolBar('Apio-ide');

      //-- APIO init (New project)
      this.toolBar.addButton({
        icon: 'file-code',
        callback: 'apio:init',
        tooltip: 'Apio: Init Project'
      });

      this.toolBar.addSpacer();

      //-- APIO Verify
      this.toolBar.addButton({
        icon: 'checklist',
        callback: 'apio:verify',
        tooltip: 'Apio: Verify'
      });

      //-- APIO Build
      this.toolBar.addButton({
        icon: 'check',
        callback: 'apio:build',
        tooltip: 'Apio: Build'
      });

      //-- APIO Upload
      this.toolBar.addButton({
        //icon: 'arrow-right',
        icon: 'upload',
        iconset: 'fa',
        callback: 'apio:upload',
        tooltip: 'Apio: Upload'
      });

      //-- Apio Clean
      this.toolBar.addButton({
        icon: 'trashcan',
        callback: 'apio:clean',
        tooltip: 'Apio: Clean'
      });


      this.toolBar.addSpacer();

      //-- Apio Sim
      this.toolBar.addButton({
        icon: 'ios-pulse-strong',
        iconset: 'ion',
        callback: 'apio:sim',
        tooltip: 'Apio: Simulation'
      });

      //-- Apio Time
      this.toolBar.addButton({
        icon: 'clock-o',
        iconset: 'fa',
        callback: 'apio:time',
        tooltip: 'Apio: Time Analysis'
      });

      this.toolBar.addSpacer();

  },


  //------------------------ Apio-ide command implementation

  //-- Test. Just for debugging
  test() {
    console.log('apio:test command');

    const MESSAGE = " Open FPGAs power!!! ";

    //-- Insert the string into the current document
    if (editor = atom.workspace.getActiveTextEditor())
      editor.insertText(MESSAGE);
  },

  //-- Command for creating a new APIO project
  initProject() {

    //-- Debug
    console.log("New project!!!!")

    //-- Open the new project panel
    var view = new NewProjectView();
    var panel = atom.workspace.addModalPanel({item: view.getElement()});

    //------------------- Set buttons handlers

    //-- Cancel button pressed: finish
    view.handleCancel = () => {
      console.log("CANCEL!!!!");
      panel.destroy();
    }

    //-- Initialize button pressed: both board and project folder has been
    //-- selected
    view.handleInit = () => {

      //-- Debug
      console.log("Creating new project...");

      //-- Get the board and project directory
      const projectPath = view.getDirectory();
      const board = view.getBoard();

      //-- Debug:
      console.log("PATH:");
      console.log(projectPath);
      console.log('Board:');
      console.log(board);

      //-- Call the apio init --board board command
      //-- Initialize the args to pass to APIO cli
      const args = ['init', '--board'];
      args.push(board)
      args.push('--project-dir');
      args.push(projectPath);

      //-- Call apio
      spawnApio(args);

      //-- Add the folder to the current project
      atom.project.addPath(projectPath);

      var template = board + "-template";

      //-- Import the template for the given board
      const args2 = ['examples', '-f', template, '-n', '--project-dir']
      args2.push(projectPath)
      spawnApio(args2);

      //-- Close the new project panel
      panel.destroy();
    }
  }, //-- Initproyect

  examples(example_name) {
    console.log("Examples!!!!");
    var projectpaths = atom.project.getPaths()

    if (projectpaths.length >= 1) {
      console.log(projectpaths);

      //-- Select only the first project path
      projectpath = projectpaths[0];

      const args = ['examples', '-f', example_name, '-n', '--project-dir'];
      args.push(projectpath);
      spawnApio(args);
    }
    else {
      console.log("NO PROJECT!");
      var core_settings = atom.config.get('core')
      console.log(core_settings.projectHome);
      projectpath = core_settings.projectHome;
      const args = ['examples', '-d', example_name, '-n', '--project-dir'];
      args.push(projectpath);
      examplepath = path.join(projectpath,example_name)
      console.log(examplepath);
      spawnApio(args);

      //-- Add the folder to the current project
      atom.project.addPath(examplepath);

    }
  },

};


//--------------------------------------------------------------------------
//--                Create the board selecction box
//---------------------------------------------------------------------------

class BoardsSelectView {

  //-- It receives the array of available boards
  //-- The first one will be used as the default board
  constructor(boards) {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
        path.resolve(__dirname, 'board-template.html'), {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    //-- Select board node
    this.boardsSelect = this.element.querySelector('.boards-select');

    // Set handler: It is called when a new board is selected
    this.boardsSelect.onchange = (event) => {
      console.log("BOARD SELECTED!!!!");
      this.selectedBoards = event.target.value
      console.log(this.selectedBoards);
      this.handleSelectBoard();
    };

    //-- Default board
    this.selectedBoards = boards[0];

    //-- Add the boards
    this.addboards(boards);
  }

  //-- Add boards to the current selection box
  //-- The fitst one is the default board
  addboards(boards) {

    removeChildrenOf(this.boardsSelect);

    for (var i = 0; i < boards.length; i++) {

      var b = document.createElement('option');
      b.textContent = boards[i]
      b.disabled = false;

      //-- The first board will be de default value
      if (i == 0) {
        b.selected = true;
      }
      else {
        b.selected = false;
      }

      //-- Add the board
      this.boardsSelect.appendChild(b);
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

//---------------------------------------------------------------------------
//--    Create the New project panel
//---------------------------------------------------------------------------

class NewProjectView {

    constructor() {

      //-- Load the html template and parse it
      const templateString = fs.readFileSync(
          path.resolve(__dirname, 'init-template.html'),
          {encoding: 'utf-8'});

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

      //-------- Set handlers

      //-- Directory, other button
      this.otherDirectoryButton.onclick = () => {
        atom.pickFolder((selectedPaths) => {
          if (!selectedPaths) {
            return;
          }
          this.addDirectories(selectedPaths);
          this.directorySelect.value = selectedPaths[selectedPaths.length - 1];
          this.doInitButton.disabled = false;
        });
      };

      //-- Initialize button
      this.doInitButton.onclick = () => {
        console.log("Constructor: INIT--------");
        this.doInitButton.textContent = 'Initializing...';
        //this.doInitButton.disabled = true;
        this.handleInit();
      };

      //-- Cancel button
      this.cancelButton.onclick = () => this.handleCancel();

      //-- Supported boards
      //-- TODO: It should be change in the future by a call to apio boards
      const boards = ['icestick','icezum','go-board'];

      //-- Create the Board selection panel
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

//----------------------------------------------------------------------------
//--  Class for build command implementation
//----------------------------------------------------------------------------


class ApioBuildProvider {

  constructor(cwd) {
    try {
      this.cwd = fs.realpathSync(cwd);
    }
    catch (e) {
      this.cwd = cwd;
    }
    this.title = 'APIO';
    console.log("New Builder!!!", this.cwd);
  }

  destructor() {
    // OPTIONAL: tear down here.
    // destructor is not part of ES6. This is called by `build` like any
    // other method before deactivating.
    console.log("ApioBuildProvider Destructor test");
    return;
  }

  getNiceName() {
    return this.title;
  }

  isEligible() {
    const stat = fs.statSyncNoException(path.join(this.cwd, 'apio.ini'));
    return stat && stat.isFile();
  }

  settings() {

    //-- Regular expresion for detecting syntax error when building (yosys)
    const errorMatch = [
         'ERROR: Parser error in line (?<file>.+):(?<line>\\d+): syntax error',
      ];

    //-- Available apio commands
    return [

        //-- APIO Verify
        {
          name: 'Apio:Verify',
          exec: 'apio',
          sh: false,
          args: [ 'verify'],
          keymap: 'ctrl-shift-v',
          atomCommandName: 'apio:verify',
          errorMatch: errorMatch
        },

        //-- APIO build
        {
          name: 'Apio:Build',
          exec: 'apio',
          sh: false,
          args: [ 'build'],
          keymap: 'ctrl-shift-b',
          atomCommandName: 'apio:build',
          errorMatch: errorMatch
        },

        //-- APIO Upload
        {
          name: 'Apio:Upload',
          exec: 'apio',
          sh: false,
          args: [ 'upload'],
          keymap: 'ctrl-shift-u',
          atomCommandName: 'apio:upload',
        },

        //-- APIO Clean
        {
          name: 'Apio:Clean',
          exec: 'apio',
          sh: false,
          args: [ 'clean'],
          keymap: 'ctrl-shift-c',
          atomCommandName: 'apio:clean',
        },

        //-- APIO Sim
        {
          name: 'Apio:Sim',
          exec: 'apio',
          sh: false,
          args: [ 'sim'],
          keymap: 'ctrl-shift-s',
          atomCommandName: 'apio:sim',
        },

        //-- APIO Time
        {
          name: 'Apio:Time',
          exec: 'apio',
          sh: false,
          args: [ 'time'],
          keymap: 'ctrl-shift-t',
          atomCommandName: 'apio:time',
        }
    ];
  }  //-- end settings()

} //-- Class


//--------------------------------  General functions

//-- Execute an apio command
//-- args: array of string with the parameters
function spawnApio(args) {
  return new Promise((resolve, reject) => {

    let stdout = '', stderr = '';

    //-- Execute the command
    const child = child_process.spawn('apio', args);

    //-- Debug: print the command output
    var text = String('');
    child.stdout.on('data', chunk => {
      text += chunk;
      console.log(text)
    });

    //-- Get the error output
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
