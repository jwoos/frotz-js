# Node integration for frotz

[![Build Status](https://travis-ci.org/jwoos/javascript_frotz.svg?branch=master)](https://travis-ci.org/jwoos/javascript_frotz)
[![Dependency Status](https://dependencyci.com/github/jwoos/javascript_frotz/badge)](https://dependencyci.com/github/jwoos/javascript_frotz)

### Installation *OPTIONAL*
**THIS WILL ONLY RUN ON NODE V6 AND UP.**: this is due to the heavy use of ES6 syntax including defining a class instead of a function and its prototypes (although it's just syntactic sugar).

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
The constructor takes four arguments currently:

1. Path to the dumb frotz executable
	- It has to be dumb frotz as the normal frotz makes use of ncurses
	- Refer to the above installation step if needed
2. Path to the game file
3. Path to the save file
	- This does not have to exist prior to running, it will be generated if it does not exist
4. A filtering function to filter text output for your sanity
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

### Example

```js
const frotz = require('node-frotz');

let interfacer = new frotz('/path/to/executable', '/path/to/game/file', '/path/to/save', aFilterFunction);

interfacer.iteration('look', (error, gameoutput) => {
	if (error) {
		// error is an object containing stderror and/or normal error
		console.log(error);
	} else {
		// output is filtered through the given or default filter and returned
		console.log(gameoutput);
	}
});
```

### How To Play
[how to play](https://github.com/DavidGriffith/frotz/blob/master/HOW_TO_PLAY)

### To Do
The following are listed in the order in which they will most likely be done

- Replace `fs.exists` with `fs.stat`
	- Needs error handling
- Incorporate Q
	- In place of typical Node callbacks
	- Instead of `setTimeout`
- [debug](https://www.npmjs.com/package/debug) ?
- Full test coverage
- Make arguments into object rather than positional
- Check if variable directories work
	- What does the given directory have to be relative to?
	- Might require `__dirname` prefix
- Break `iteration` into separate functions
- Validate paths passed as arguments
	- `fs.stat`
- Look into encoding
	- Is iconv really needed?
- Write a better filtering function
- Continuous session
