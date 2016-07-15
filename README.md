# Node integration for frotz

```js
const frotz=require('node-frotz');

let dint = new frotz.DFrotzInterface('./ifroot/dfrotz', './ifroot/ZORK1.DAT', "./ifroot/zk1.sav", frotz.ZorkFilter);

dint.iteration("look", (error, gameoutput) => {
	if(error) {
		console.log(error);
	} else {
		console.log(gameoutput);
	}

	process.exit(0);
});
```

# Installation
This module requires the dfrotz binary.

1. Clone https://github.com/DavidGriffith/frotz
2. Go to the cloned directory and `make dumb`
	- This compiles the "dumb version" which does not depend on ncurses and uses only terminal: https://github.com/DavidGriffith/frotz/blob/master/DUMB
3. `make install_dumb` to install
	- You may need sudo permissions
	- `make uninstall_dumb` to uninstall
