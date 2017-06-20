'use babel';

//---------------------------------------------------------------------------
//--    Create the Init project panel
//---------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';


export default class InitProjectView {

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
