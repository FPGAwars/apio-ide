'use babel';

//---------------------------------------------------------------------------
//--    Create the Init project panel
//---------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';

import { spawnApio } from '../utils';


class InitProjectView {

  constructor() {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'templates/init-project.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.apio-template-root').cloneNode(true);

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


//-- Command for initialize a new APIO project
export function initProject() {

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
