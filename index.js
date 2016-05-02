const fs = require('fs');
const exec = require('child_process').execFile;
const dfrotz_file = './ifroot/dfrotz';
const zork1 =  ['-w','500','./ifroot/ZORK1.DAT'];
function ZorkFilter(element,index,array)
{
    if(array.length ==3 && index ==0)
	return true;
    if(index < 2)
	return false;
    if(element != "" && element[0] == '>')
	return false;
    if(element=="")
	return false;
    return true;
}
function DFrotzInterface(proc_cmd,proc_arg)
{
    var that = this;
    that.dfrotz = null;
    that.dropAll=true;
    that.getSaveFilename=()=>{
	return "z1.sav";
    };
    that.command=(cmd)=>{
	that.dfrotz.stdin.write(`${cmd}\n`);
    };
    that.iteration=(cmd,done_callback)=>{
	var output ="";
	if(!cmd)
	    cmd="";
	fs.exists(that.getSaveFilename(),(save_file_exists)=>{
	    that.dropAll=save_file_exists;
	    that.dfrotz = exec(proc_cmd,proc_arg,(error, stdout, stderr) => {
		if(error)
		    console.log(error);
		if(stderr)
		    console.log(stderr);
	    });
	    that.dfrotz.on('close',(code)=>{
		done_callback(output);
	    });
	    that.dfrotz.stdout.on('data', (data) => {
		data = data.trim()
		if(data !== "")
		{
		    if(that.dropAll == false)
		    {
			output = output+data;
		    }
		} 
	    });
	    
	    if(save_file_exists)
	    {
		// Check file before restore
		that.command("restore");
		that.command(that.getSaveFilename());
	    }
	    setTimeout(()=>{
		that.dropAll=false;
		if(cmd && cmd != "")
		    that.command(cmd);
		setTimeout(()=>{
		    that.dropAll=true
		    //Always save
		    that.command("save");
		    that.command(that.getSaveFilename());
		    that.command("Y");
		    that.command("quit");
		    that.command("Y");
		},100);
	    },100);

		
	});
    };
    
}
function dfrotz_command(process,command)
{
    process.stdin.write(`${command}\n`);
}

var dint = new DFrotzInterface(dfrotz_file,zork1);
dint.iteration(process.argv[2],(gameoutput)=>{
    gameoutput =gameoutput.replace('\r','');
    gameoutput = gameoutput.split('\n').filter(ZorkFilter);
    
    console.log(gameoutput);
});
