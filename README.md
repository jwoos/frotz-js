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

[how to play](https://github.com/DavidGriffith/frotz/blob/master/HOW_TO_PLAY)
