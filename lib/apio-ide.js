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
//-- deactivate():  It is called When the apio-ide package is disabled
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
//--  * apio:verify: Execute apio verify
//--  * apio:build: Execute apio build
//--  * apio:upload: Execute apio upload
//--  * apio:clean: Execute apio clean
//--
//--  * apio:sim: Execute apio sim
//--  * apio:time: Execute apio time
//----------------------------------------------------------------------------

export default {
  config: config,
  subscriptions: null,

  //-- Build atom package entry point. It returns the class for managing
  //-- the apio-ide builds (All the apio-ide build commands are provide
  //--  there)
  provideBuilder: () => ApioBuildProvider,

  //-- Apio-ide entry point. When the package is enabled, it will be called
  //-- when atom is ready
  activate(state) {
    require('atom-package-deps').install('apio-ide');

    this.handleCustomPATH(atom.config.get('apio-ide.customPATH'));
    this.subscriptions = new CompositeDisposable();
    this.setupCommands()
  },

  setupCommands: function () {

    //-- Apio-ide Commnad implementation
    this.subscriptions.add(atom.commands.add('atom-workspace', {

      //-- Initialize project command. It opens and manages the new project panel
      'apio:init': () => {
        this.initProject()
      },

      //-- Load example command. It opens and manages the examples panel
      'apio:example': () => {
        this.loadExample()
      },

      //-- Show apio version
      'apio:version': () => {
        this.showVersion()
      },

      //----------------- Board Pinouts -----------------------------------

      'apio:pinout-icestick':
        () => shell.openExternal('http://www.pighixxx.com/test/2016/02/icestick-pinout/'),

      'apio:pinout-icezum':
        () => shell.openExternal('https://raw.githubusercontent.com/FPGAwars/icezum/master/doc/pinout/icezum-pinout.png'),

      'apio:pinout-go-board':
        () => shell.openExternal('https://www.nandland.com/goboard/images/Go_Board_V1.pdf'),

      'apio:pinout-icoboard':
        () => shell.openExternal('http://icoboard.org/icoboard-1-0.html'),

      'apio:pinout-iCE40-HX8K':
        () => shell.openExternal('http://www.latticesemi.com/view_document?document_id=50373'),

      'apio:pinout-Cat-board':
        () => shell.openExternal('https://raw.githubusercontent.com/xesscorp/CAT-Board/master/docs/Manual/pics/CAT_schematic.pdf'),

    }));

    this.subscriptions.add(
      atom.config.onDidChange('apio-ide.customPATH', (event) => {
        this.handleCustomPATH(event.newValue, event.oldValue);
      })
    );

  },

  handleCustomPATH: (newValue, oldValue) => {
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
  deactivate: () => {
    this.subscriptions.dispose();
    if (this.toolBar) {
      this.toolBar.removeItems();
      this.toolBar = null;
    }
  },

  //-- Entry point: Toolbar.  It is called by the toolbar package
  //-- It creates the apio-ide toolbar buttons
  consumeToolBar: (toolBar) => {
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

  //-- Command for initialize a new APIO project
  initProject() {

    //-- Debug
    console.log("Init Project")

    //-- Open the new project panel
    var view = new InitProjectView();
    var panel = atom.workspace.addModalPanel({item: view.getElement()});

    //------------------- Set buttons handlers

    //-- Cancel button pressed: finish
    view.handleCancel = () => panel.destroy();

    //-- Initialize button pressed: both board and project folder has been
    //-- selected
    view.handleInit = () => {

      //-- Debug
      console.log('Initialize...');

      //-- Get the board and project directory
      const projectPath = view.getDirectory();
      const board = view.getBoard();

      //-- Debug:
      console.log('PATH: ', projectPath);
      console.log('Board: ', board);

      //-- Call the apio init --board board command
      //-- Initialize the args to pass to APIO cli
      const args = ['init', '--board', board, '-y', '--project-dir', projectPath];

      //-- Call apio
      spawnApio(args);

      //-- Add the folder to the current project
      atom.project.addPath(projectPath);

      //-- Close the new project panel
      panel.destroy();
    };

    const paths = atom.project.getPaths();
    if (paths.length > 0) {
      view.addDirectories(paths, paths[paths.length - 1]);
    }
  }, //-- Init project


  //-- Command for load an example
  loadExample() {

    //-- Debug
    console.log("Load Example")

    //-- Open the examples panel
    var view = new LoadExampleView();
    var panel = atom.workspace.addModalPanel({item: view.getElement()});

    //------------------- Set buttons handlers

    //-- Cancel button pressed: finish
    view.handleCancel = () => panel.destroy();

    //-- Initialize button pressed: both board and project folder has been
    //-- selected
    view.handleInit = () => {

      //-- Debug
      console.log('Load...');

      //-- Get the board and project directory
      const projectPath = view.getDirectory();
      const example = view.getExample();

      //-- Debug:
      console.log('PATH: ', projectPath);
      console.log('Example: ', example);

      //-- Call the apio examples --files example command
      //-- Initialize the args to pass to APIO cli
      const args = ['examples', '--files', example, '-n', '--project-dir', projectPath];

      //-- Call apio
      spawnApio(args);

      //-- Add the folder to the current project
      atom.project.addPath(projectPath);

      //-- Close the new project panel
      panel.destroy();
    };

    const paths = atom.project.getPaths();
    if (paths.length > 0) {
      view.addDirectories(paths, paths[paths.length - 1]);
    }
  }, //-- Load example

  showVersion() {

    //-- Call the apio --version
    const args = ['--version'];

    //-- Call apio
    spawnApio(args)
    .then((stdout) => atom.notifications.addInfo(stdout))
    .catch((stderr) => atom.notifications.addWarning(stderr));

  } //-- Show version

};


//---------------------------------------------------------------------------
//--    Create the Init project panel
//---------------------------------------------------------------------------

class InitProjectView {

  constructor() {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'templates/init-project.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    // Find important nodes
    this.boardSelect = this.element.querySelector('.board-select');
    this.directorySelect = this.element.querySelector('.directory-select');
    this.otherDirectoryButton = this.element.querySelector('.other-directory');
    this.doInitButton = this.element.querySelector('.controls .do-init');
    this.cancelButton = this.element.querySelector('.controls .cancel');

    //-------- Set handlers

    //-- Directory, other button
    this.otherDirectoryButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        this.addDirectories(selectedPaths, selectedPaths[selectedPaths.length - 1]);
      });
    };

    //-- Initialize button
    this.doInitButton.onclick = () => {
      this.doInitButton.textContent = 'Initializing...';
      //this.doInitButton.disabled = true;
      this.handleInit();
    };

    //-- Cancel button
    this.cancelButton.onclick = () => this.handleCancel();

  } //-- End constructor

  updateInitButtonDisabled() {
    const directorySelected = this.directorySelect.value.toString().length > 0;
    this.doInitButton.disabled = !directorySelected;
  }

  addDirectories(directories, activeDir) {
    for (const dir of directories) {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      if (dir == activeDir) {
        option.selected = true;
      }
      this.directorySelect.appendChild(option);
    }
    if (directories.length > 0) {
      this.updateInitButtonDisabled();
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
    return this.boardSelect.value;
  }

  destroy() {
    this.element.remove();
  }

} //-- End class


//---------------------------------------------------------------------------
//--    Create the Load example panel
//---------------------------------------------------------------------------

class LoadExampleView {

  constructor() {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'templates/load-example.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    // Find important nodes
    this.exampleSelect = this.element.querySelector('.example-select');
    this.directorySelect = this.element.querySelector('.directory-select');
    this.otherDirectoryButton = this.element.querySelector('.other-directory');
    this.doLoadButton = this.element.querySelector('.controls .do-load');
    this.cancelButton = this.element.querySelector('.controls .cancel');

    //-------- Set handlers

    //-- Directory, other button
    this.otherDirectoryButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        this.addDirectories(selectedPaths, selectedPaths[selectedPaths.length - 1]);
      });
    };

    //-- Initialize button
    this.doLoadButton.onclick = () => {
      this.doLoadButton.textContent = 'Loading...';
      //this.doLoadButton.disabled = true;
      this.handleInit();
    };

    //-- Cancel button
    this.cancelButton.onclick = () => this.handleCancel();

  } //-- End constructor

  updateLoadButtonDisabled() {
    const directorySelected = this.directorySelect.value.toString().length > 0;
    this.doLoadButton.disabled = !directorySelected;
  }

  addDirectories(directories, activeDir) {
    for (const dir of directories) {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      if (dir == activeDir) {
        option.selected = true;
      }
      this.directorySelect.appendChild(option);
    }
    if (directories.length > 0) {
      this.updateLoadButtonDisabled();
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

  getExample() {
    return this.exampleSelect.value;
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

      //-- APIO Upload
      {
        name: 'Apio:Upload',
        exec: 'apio',
        sh: false,
        args: [ 'upload'],
        keymap: 'ctrl-alt-u',
        atomCommandName: 'apio:upload',
      },

      //-- APIO Clean
      {
        name: 'Apio:Clean',
        exec: 'apio',
        sh: false,
        args: [ 'clean'],
        keymap: 'ctrl-alt-c',
        atomCommandName: 'apio:clean',
      },

      //-- APIO Verify
      {
        name: 'Apio:Verify',
        exec: 'apio',
        sh: false,
        args: [ 'verify'],
        atomCommandName: 'apio:verify'
      },

      //-- APIO Sim
      {
        name: 'Apio:Sim',
        exec: 'apio',
        sh: false,
        args: [ 'sim'],
        atomCommandName: 'apio:sim',
      },

      //-- APIO Time
      {
        name: 'Apio:Time',
        exec: 'apio',
        sh: false,
        args: [ 'time'],
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

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
