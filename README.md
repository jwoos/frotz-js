# Node integration for frotz

[![Build Status](https://travis-ci.org/jwoos/javascript_frotz.svg?branch=master)](https://travis-ci.org/jwoos/javascript_frotz)
[![Dependency Status](https://dependencyci.com/github/jwoos/javascript_frotz/badge)](https://dependencyci.com/github/jwoos/javascript_frotz)
[![Coverage Status](https://coveralls.io/repos/github/jwoos/javascript_frotz/badge.svg)](https://coveralls.io/github/jwoos/javascript_frotz)

Please note that this is written in ES6 and tranpile using Babel. Initially, I only allowed usage on Node > v6 but decided that backward compatibility was also important. In the future, I will implement usage of the ES6 source files for those who are on v6 and above.

### What is this?
This is a Node interface for playing Infocom games and other Z-machine games through the use of Frotz, an interpreter. It is essentially a wrapper for interacting with the CLI only version of the interpreter (dumb frotz). Now you can play text games via your JavaScript applications!

### Installation

```bash
npm install frotz-interfacer
```

*OPTIONAL:*
This module requires the dfrotz binary. One is provided but maybe you just want to compile it yourself?

1. Clone https://github.com/DavidGriffith/frotz
2. Go to the cloned directory and `make dumb`
	- This compiles the 'dumb version' which does not depend on ncurses and uses only terminal: https://github.com/DavidGriffith/frotz/blob/master/DUMB
3. `make install_dumb` to install
	- You may need sudo permissions
	- `make uninstall_dumb` to uninstall
OR
3. Copy the dfrotz executable to your path of choice and make note of it

### Interfacer
The constructor takes an object of four arguments currently:

1. `executable`: Path to the dumb frotz executable
	- It has to be dumb frotz as the normal frotz makes use of ncurses
	- Refer to the above installation step if needed
2. `gameImage`: Path to the game file
3. `saveFile`: Path to the save file
	- This does not have to exist prior to running, it will be generated if it does not exist
4. `outputFilter`: A filtering function to filter text output for your sanity
	- This will by default use a static method on the interfacer

All of the above have a default and in the event that you don't pass along some or even all the arguments, they will be replaced with the default values.

```js
const default = {
	executable: './frotz/dfrotz',
	gameImage: './frotz/data/zork1/DATA/ZORK1.DAT',
	saveFile: './frotz/data/zork1/SAVE/zork1.sav',
	outputFilter: DFrotzInterface.filter
};
```

One call of iteration will start the game from a save if there is one otherwise it will create a new save. It will then run your action and save and quit automatically. This reduces the overhead of session management and introduces the benefit of having multiple games going on at once.

Iteration can (and should) be called with a callback which takes `error` and `output`. Their structure is described below:

```js
error: {
	stderr: '' // [object String]: dfrotz stderr,
	error: {} // [object Error]: error from running dfrotz
}

output: {
	pretty: [''] // [object Array] of [object String]: text that has been filtered and trimmed
	full: '' // [object String]: dfrotz stdout
}
```

### Example

```js
const frotz = require('node-frotz');

let interfacer = new frotz({
	executable: '/path/to/executable',
	gameImage: '/path/to/game/file',
	saveFile: '/path/to/save',
	outputFilter: aFilterFunction
});

interfacer.iteration('look', (error, output) => {
	if (error) {
		console.log(error.error);
	} else {
		console.log(output.pretty);
	}
});
```

### How To Play
[How to play](https://github.com/DavidGriffith/frotz/blob/master/HOW_TO_PLAY)

### To Do
Check the [to do list](https://github.com/jwoos/javascript_frotz/issues)
