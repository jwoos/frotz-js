'use strict';
const fs = require('fs');
const exec = require('child_process').execFile;
const iconv = require('iconv');
function ZFilter(element,index,array)
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
function DFrotzInterface(dfrotz_executable,dfrotz_game_image,save_file,output_filter=undefined)
{
    var that = this;
    that.dfrotz = null; 
    that.dfrotz_executable=dfrotz_executable;
    that.dfrotz_game_image=dfrotz_game_image; 
    that.save_file=save_file; 
    that.output_filter=output_filter;
    that.dropAll=true;
    that.save_file = save_file;
    return that;
}

DFrotzInterface.prototype.get_save_filename=function(){
    var that = this;
    return that.save_file;
};
DFrotzInterface.prototype.command = function(cmd){
    var that = this;
    that.dfrotz.stdin.write(`${cmd}\n`);
};

DFrotzInterface.prototype.iteration=function(cmd,done_callback){
    var output ="";
    var perror=undefined;
    var that=this;
    if(!cmd)
	cmd="";
    fs.exists(that.get_save_filename(),(save_file_exists)=>{
	var dfrotz_arg =  ['-w','500','-h','999',that.dfrotz_game_image];
	that.dropAll=save_file_exists;
	
	that.dfrotz = exec(that.dfrotz_executable,dfrotz_arg,{"encoding":"latin1"},(error, stdout, stderr) => {
	    if(error)
		perror = error;
	    if(stderr)
		perror = stderr;
	});
	that.dfrotz.on('close',(code)=>{
	    if(!perror || perror.length==0)
	    {
		output = output.replace('\r','');
		output = output.split('\n');
		if(that.output_filter)
		    output=output.filter(that.output_filter);
	    }
	    done_callback(perror,output);
	});
	that.dfrotz.stdout.on('data', (data) => {
	    var encoder = new iconv.Iconv('latin1', 'utf-8');
	    data= encoder.convert(data, 'utf8');
//	    console.log(data.toString());
	    data = data.toString();
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
	    that.command(that.get_save_filename());
	}
	setTimeout(()=>{
	    that.dropAll=false;
	    if(cmd && cmd != "")
	    {
		that.command(cmd);
	    }
	    setTimeout(()=>{
		that.dropAll=true
		that.command("save");
		that.command(that.get_save_filename());
		that.command("Y");
		that.command("quit");
		that.command("Y");
		that.command("SI");
	    },100);
	},100);
    });
};
exports.DFrotzInterface=DFrotzInterface;
exports.ZFilter=ZFilter;
/*var dint = new DFrotzInterface('./ifroot/dfrotz','./ifroot/enigma.dat',"./ifroot/enigma.sav",ZFilter);
dint.iteration(process.argv[2],(error,gameoutput)=>{
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
*/
