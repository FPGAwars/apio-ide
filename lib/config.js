'use babel';

//----------------------------------------------------------------------------
//-- Atom settings configuration
//----------------------------------------------------------------------------

export const ATOM_CONFIG = {
  customPath: {
    title: 'Environment PATH to run `apio`',
    description: 'Paste here the result of `echo $PATH` (Unix) / `echo %PATH%` ' +
                 '(Windows) command by typing into your system terminal',
    type: 'string',
    default: '',
    order: 100
  }
};
