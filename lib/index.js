'use strict';

const fs = require('fs');
const q = require('q');
const exec = require('child_process').execFile;
const iconv = require('iconv');

const defaults = {
	executable: './frotz/dfrotz',
	gameImage: './frotz/data/zork1/DATA/ZORK1.DAT',
	saveFile: './frotz/data/zork1/SAVE/zork1.sav',
	outputFilter: ZFilter
};

function ZFilter(elem, index, arr) {
	if (arr.length === 3 && index === 0) {
		return true;
	}

	if (index < 2) {
		return false;
	}

	if (elem && elem[0] === '>') {
		return false;
	}

	if (!elem) {
		return false;
	}

	return true;
}

class DFrotzInterface {
	constructor(executable, gameImage, saveFile, outputFilter) {
		this.dfrotz = null;

		this.executable = executable || defaults.executable;
		this.gameImage = gameImage || defaults.gameImage;
		this.saveFile = saveFile || defaults.saveFile;
		this.outputFilter = outputFilter || defaults.outputFilter;

		this.dropAll = true;
	}

	get saveFileName() {
		return this.saveFile;
	}

	command(cmd) {
		this.dfrotz.stdin.write(`${cmd}\n`);
	}

	iteration(cmd, cb) {
		let output, perror;

		cmd = cmd || '';

		fs.exists(this.saveFileName, (saveFileExists) => {
			let dfrotzArgs =  ['-w', '500', '-h', '999', this.gameImage];
			this.dropAll = saveFileExists;

			this.dfrotz = exec(this.executable, dfrotzArgs, {"encoding":"latin1"}, (error, stdout, stderr) => {
				if (error) {
					perror = error;
				}

				if (stderr) {
					perror = stderr;
				}
			});

			this.dfrotz.on('close', (code) => {
				if (!perror) {
					output = output.replace('\r','').split('\n');

					if (this.outputFilter) {
						output = output.filter(this.outputFilter);
					}
				}

				cb(perror, output);
			});

			this.dfrotz.stdout.on('data', (data) => {
				let encoder = new iconv.Iconv('latin1', 'utf-8');
				data = encoder.convert(data, 'utf8').toString().trim();

				if (data && !this.dropAll) {
					output += data;
				}
			});

			if (saveFileExists) {
				// Check file before restore
				this.command("restore");
				this.command(this.saveFileName);
			}

			setTimeout(() => {
				this.dropAll = false;

				if (cmd && cmd !== "") {
					this.command(cmd);
				}

				setTimeout(() => {
					this.dropAll = true
					this.command("save");
					this.command(this.saveFileName);
					this.command("Y");
					this.command("quit");
					this.command("Y");
					this.command("SI");
				}, 100);
			}, 100);
		});
	}
}

module.exports = {
	DFrotzInterface: DFrotzInterface,
	ZFilter: ZFilter
};

/*let dint = new DFrotzInterface('./ifroot/dfrotz','./ifroot/enigma.dat',"./ifroot/enigma.sav",ZFilter);
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
