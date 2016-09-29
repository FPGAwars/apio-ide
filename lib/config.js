'use babel';

//--------------------------------------------------------------------------
//-- APIO-IDE
//-- (c) FPGAwars
//--     Jesús Arroyo Torrens (Sep, 2016)
//-- derived from the Platformio-ide
//---------------------------------------------------------------------------
//-- GPL LICENSE
//---------------------------------------------------------------------------

import os from 'os';
import path from 'path';

export default {
  customPATH: {
    title: 'Environment PATH to run `apio`',
    description: 'Paste here the result of `echo $PATH` (Unix) / `echo %PATH%` ' +
                 '(Windows) command by typing into your system terminal',
    type: 'string',
    default: '',
    order: 100
  }
};
