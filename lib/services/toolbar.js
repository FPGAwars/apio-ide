'use babel';

//----------------------------------------------------------------------------
//--  Class for toolbar implementation
//----------------------------------------------------------------------------

import { Disposable } from 'atom';

let currentToolbar = null;


export function ToolbarConsumer(toolbar) {

  if (currentToolbar) {
    return;
  }

  currentToolbar = toolbar('apio-ide');

  //-- APIO init (New project)
  currentToolbar.addButton({
    icon: 'file-code',
    callback: 'apio-ide:initialize-project',
    tooltip: 'Apio: Init Project'
  });

  currentToolbar.addSpacer();

  //-- APIO Verify
  currentToolbar.addButton({
    icon: 'checklist',
    callback: 'apio-ide:target:verify',
    tooltip: 'Apio: Verify'
  });

  //-- APIO Build
  currentToolbar.addButton({
    icon: 'check',
    callback: 'apio-ide:target:build',
    tooltip: 'Apio: Build'
  });

  //-- APIO Upload
  currentToolbar.addButton({
    //icon: 'arrow-right',
    icon: 'upload',
    iconset: 'fa',
    callback: 'apio-ide:target:upload',
    tooltip: 'Apio: Upload'
  });

  //-- Apio Clean
  currentToolbar.addButton({
    icon: 'trashcan',
    callback: 'apio-ide:target:clean',
    tooltip: 'Apio: Clean'
  });


  currentToolbar.addSpacer();

  //-- Apio Sim
  currentToolbar.addButton({
    icon: 'ios-pulse-strong',
    iconset: 'ion',
    callback: 'apio-ide:target:sim',
    tooltip: 'Apio: Simulation'
  });

  //-- Apio Time
  currentToolbar.addButton({
    icon: 'clock-o',
    iconset: 'fa',
    callback: 'apio-ide:target:time',
    tooltip: 'Apio: Time Analysis'
  });

  return new Disposable(() => {
    currentToolbar.removeItems();
    currentToolbar = null;
  });
}
