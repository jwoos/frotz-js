# node-frotz
Node integration for frotz

```js
const frotz=require('node-frotz');
var dint = new frotz.DFrotzInterface('./ifroot/dfrotz','./ifroot/ZORK1.DAT',"./ifroot/zk1.sav",frotz.ZorkFilter);
dint.iteration("look",(error,gameoutput)=>{
    if(error)
    {
	console.log(error);
    }
    else
    {
	console.log(gameoutput);
    }
    process.exit(0);
});
```

## Installation
This module requires the dfrotz binary. Please refer to https://github.com/DavidGriffith/frotz for instruction.

```bash
$ npm install node-frotz
```
