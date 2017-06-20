'use babel';

//---------------------------------------------------------------------------
//--    Create the Load example panel
//---------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';

import { spawnApio } from '../utils';


class LoadExampleView {

  constructor() {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'templates/load-example.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.apio-template-root').cloneNode(true);

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


//-- Command for load an example
export function loadExample() {

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
