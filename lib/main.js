'use babel';

//--------------------------------------------------------------------------
//-- APIO-IDE main file
//-- (c) FPGAwars
//--     Juan Gonzalez-Gomez (Obijuan) (May, 2016)
//--     Jesús Arroyo Torrens (Sep, 2016) (Jun, 2017)
//-- derived from the Platformio-ide
//--------------------------------------------------------------------------
//-- GPL LICENSE
//--------------------------------------------------------------------------

import * as config from './config';
import * as utils from './utils';

import BuildProvider from './services/build';
import { ToolbarConsumer } from './services/toolbar';
import { initProject } from './views/init-project';
import { loadExample } from './views/load-example';
import { CompositeDisposable } from 'atom';

import { apio } from '../package';

//-------------- ENTRY POINT -----------------------------------------------
//--
//-- Interface methods:
//--
//-- activate():  It is called When the apio-ide package is enabled
//--
//-- deactivate():  It is called When the apio-ide package is disabled
//--
//-- provideBuild: It returns the class for managing the build
//--  It implements all the apio-ide building methods
//--
//-- consumeToolbar: method is a callback for the tool-bar package
//--   It is called when the toolbar is activated
//--
//--------------------------------------------------------------------------
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
//--------------------------------------------------------------------------

let subscriptions = null;


export default {

  config: config.ATOM_CONFIG,
  provideBuilder: () => BuildProvider,
  consumeToolbar: ToolbarConsumer,

  //-- Apio-ide entry point. When the package is enabled, it will be called
  //-- when atom is ready
  activate() {
    require('atom-package-deps').install('apio-ide');
    if (!subscriptions) {
      subscriptions = new CompositeDisposable();
      this.setupCommands();
    }
    utils.checkVersion(apio.min, apio.max).catch(() => {
      atom.notifications.addError('Required apio version >=' + apio.min + '<' + apio.max);
    });
    console.log('Activate');
  },

  //-- Apio-ide exit point. When the package is disabled, it will be called
  //-- when atom is ready
  deactivate() {
    subscriptions.dispose();
    subscriptions = null;
    console.log('Deactivate');
  },

  setupCommands() {

    //-- Apio-ide Commnad implementation
    subscriptions.add(atom.commands.add('atom-workspace', {

      //-- Initialize project command. It opens and manages the new project panel
      'apio-ide:initialize-project':
        () => initProject(),

      //-- Load example command. It opens and manages the examples panel
      'apio-ide:load-example':
        () => loadExample(),

      //-- Show apio version
      'apio-ide:version':
        () => utils.showVersion(),

      //----------------- Board Pinouts -----------------------------------

      'apio-ide:pinout:icestick':
        () => utils.openUrl('http://www.pighixxx.com/test/2016/02/icestick-pinout/'),

      'apio-ide:pinout:icezum':
        () => utils.openUrl('https://raw.githubusercontent.com/FPGAwars/icezum/master/doc/pinout/icezum-pinout.png'),

      'apio-ide:pinout:go-board':
        () => utils.openUrl('https://www.nandland.com/goboard/images/Go_Board_V1.pdf'),

      'apio-ide:pinout:icoboard':
        () => utils.openUrl('http://icoboard.org/icoboard-1-0.html'),

      'apio-ide:pinout:iCE40-HX8K':
        () => utils.openUrl('http://www.latticesemi.com/view_document?document_id=50373'),

      'apio-ide:pinout:Cat-board':
        () => utils.openUrl('https://raw.githubusercontent.com/xesscorp/CAT-Board/master/docs/Manual/pics/CAT_schematic.pdf'),

      'apio-ide:pinout:TinyFPGA-B2':
        () => utils.openUrl('http://tinyfpga.com/b-series-guide.html'),

      'apio-ide:pinout:blackice':
        () => utils.openUrl('https://mystorm.uk/')

    }));

    subscriptions.add(
      atom.config.onDidChange('apio-ide.customPath', (event) => {
        utils.handleCustomPath(event.newValue, event.oldValue);
      })
    );

  }

}
