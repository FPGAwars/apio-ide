'use babel';

//--------------------------------------------------------------------------
//-- APIO-IDE main file
//-- (c) FPGAwars
//--     Juan Gonzalez-Gomez (Obijuan) (May, 2016)
//--     Jesús Arroyo Torrens (Sep, 2016) (Jun, 2017)
//-- derived from the Platformio-ide
//---------------------------------------------------------------------------
//-- GPL LICENSE
//---------------------------------------------------------------------------

import * as config from './config';

import path from 'path';
import shell from 'shell';
import child_process from 'child_process';

import { CompositeDisposable } from 'atom';

import BuildProvider from './services/build';
import { ToolbarConsumer } from './services/toolbar';

import InitProjectView from './views/init-project';
import LoadExampleView from './views/load-example';

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
//--  * apio-ide:initialize-project:  Open and manage the new project panel
//--  * apio-ide:load-example:  Load selected example
//--
//--  * apio-ide:target:verify: Execute apio verify
//--  * apio-ide:target:build: Execute apio build
//--  * apio-ide:target:upload: Execute apio upload
//--  * apio-ide:target:clean: Execute apio clean
//--
//--  * apio-ide:target:sim: Execute apio sim
//--  * apio-ide:target:time: Execute apio time
//
//--  * apio-ide:version: Show apio version
//----------------------------------------------------------------------------


class ApioIDEPackage {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.config = config.ATOM_CONFIG;
    // services
    this.provideBuilder = () => BuildProvider;
    this.consumeToolbar = ToolbarConsumer;
  }

  //-- Apio-ide entry point. When the package is enabled, it will be called
  //-- when atom is ready
  activate() {
    require('atom-package-deps').install('apio-ide');
    this.setupCommands();
    console.log('Activate');
  }

  setupCommands() {

    //-- Apio-ide Commnad implementation
    this.subscriptions.add(atom.commands.add('atom-workspace', {

      //-- Initialize project command. It opens and manages the new project panel
      'apio-ide:initialize-project':
        () => this.initProject(),

      //-- Load example command. It opens and manages the examples panel
      'apio-ide:load-example':
        () => this.loadExample(),

      //-- Show apio version
      'apio-ide:version':
        () => this.showVersion(),

      //----------------- Board Pinouts -----------------------------------

      'apio-ide:pinout:icestick':
        () => shell.openExternal('http://www.pighixxx.com/test/2016/02/icestick-pinout/'),

      'apio-ide:pinout:icezum':
        () => shell.openExternal('https://raw.githubusercontent.com/FPGAwars/icezum/master/doc/pinout/icezum-pinout.png'),

      'apio-ide:pinout:go-board':
        () => shell.openExternal('https://www.nandland.com/goboard/images/Go_Board_V1.pdf'),

      'apio-ide:pinout:icoboard':
        () => shell.openExternal('http://icoboard.org/icoboard-1-0.html'),

      'apio-ide:pinout:iCE40-HX8K':
        () => shell.openExternal('http://www.latticesemi.com/view_document?document_id=50373'),

      'apio-ide:pinout:Cat-board':
        () => shell.openExternal('https://raw.githubusercontent.com/xesscorp/CAT-Board/master/docs/Manual/pics/CAT_schematic.pdf'),

    }));

    this.subscriptions.add(
      atom.config.onDidChange('apio-ide.customPATH', (event) => {
        this.handleCustomPATH(event.newValue, event.oldValue);
      })
    );

  }

  handleCustomPATH(newValue, oldValue) {
    if (oldValue) {
      process.env.PATH = process.env.PATH.replace(oldValue + path.delimiter, '');
      process.env.PATH = process.env.PATH.replace(path.delimiter + oldValue, '');
    }
    if (newValue && process.env.PATH.indexOf(newValue) < 0) {
      process.env.PATH = newValue + path.delimiter + process.env.PATH;
    }
  }

  //-- Apio-ide exit point. When the package is disabled, it will be called
  //-- when atom is ready
  deactivate() {
    this.subscriptions.dispose();
    console.log('Deactivate');
  }

  //------------------------ Apio-ide command implementation

  //-- Command for initialize a new APIO project
  initProject() {

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

      console.log('Initialize...');

      //-- Get the board and project directory
      const projectPath = view.getDirectory();
      const board = view.getBoard();

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
  } //-- Init project

  //-- Command for load an example
  loadExample() {

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

      console.log('Load...');

      //-- Get the board and project directory
      const projectPath = view.getDirectory();
      const example = view.getExample();

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
  } //-- Load example

  showVersion() {

    //-- Call the apio --version
    const args = ['--version'];

    //-- Call apio
    spawnApio(args)
    .then((stdout) => atom.notifications.addInfo(stdout))
    .catch((stderr) => atom.notifications.addWarning(stderr));

  } //-- Show version

}


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


//-- Export Package instance

const apioide = new ApioIDEPackage();
export default apioide;
