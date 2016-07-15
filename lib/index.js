'use strict';

const fs = require('fs');
const q = require('q');
const childProcess = require('child_process');
const iconv = require('iconv');


class DFrotzInterface {
	constructor(executable, gameImage, saveFile, outputFilter) {
		const defaults = {
			executable: './frotz/dfrotz',
			gameImage: './frotz/data/zork1/DATA/ZORK1.DAT',
			saveFile: './frotz/data/zork1/SAVE/zork1.sav',
			outputFilter: DFrotzInterface.filter
		};

		this.encoder = new iconv.Iconv('latin1', 'utf-8');
		this.dfrotz = null;

		this.executable = executable || defaults.executable;
		this.gameImage = gameImage || defaults.gameImage;
		this.saveFile = saveFile || defaults.saveFile;
		this.outputFilter = outputFilter || defaults.outputFilter;

		this.dropAll = true;
	}

	static filter(elem, index, arr) {
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

	command(cmd) {
		this.dfrotz.stdin.write(`${cmd}\n`);
	}

	iteration(cmd, cb) {
		let output,
			pError = {};

		cmd = cmd || '';

		fs.exists(this.saveFile, (saveFileExists) => {
			let dfrotzArgs =  ['-w', '500', '-h', '999', this.gameImage];
			this.dropAll = saveFileExists;

			this.dfrotz = childProcess.execFile(this.executable, dfrotzArgs, {encoding: 'latin1'}, (error, stdout, stderr) => {
				if (error) {
					pError.error = error;
				}

				if (stderr) {
					pError.stderr = stderr.toString() ? stderr.toString() : null;
				}
			});

			this.dfrotz.on('close', (code) => {
				if (!pError.stderr && !pError.error) {
					output = output.replace('\r','').split('\n');

					if (this.outputFilter) {
						output = output.filter(this.outputFilter);
					}
				}

				cb(pError, output);
			});

			this.dfrotz.stdout.on('data', (data) => {
				data = this.encoder.convert(data, 'utf8').toString().trim();

				if (data && !this.dropAll) {
					output += data;
				}
			});

			if (saveFileExists) {
				// Check file before restore
				this.command('restore');
				this.command(this.saveFile);
			}

			setTimeout(() => {
				this.dropAll = false;

				if (cmd && cmd !== '') {
					this.command(cmd);
				}

				setTimeout(() => {
					this.dropAll = true
					this.command('save');
					this.command(this.saveFile);
					this.command('Y');
					this.command('quit');
					this.command('Y');
					this.command('SI');
				}, 100);
			}, 100);
		});
	}
}

module.exports = DFrotzInterface;
