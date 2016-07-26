'use strict';

const fs = require('fs');
const q = require('q');
const childProcess = require('child_process');

class DFrotzInterface {
	constructor(executable, gameImage, saveFile, outputFilter) {
		const defaults = {
			executable: './frotz/dfrotz',
			gameImage: './frotz/data/zork1/DATA/ZORK1.DAT',
			saveFile: './frotz/data/zork1/SAVE/zork1.sav',
			outputFilter: DFrotzInterface.filter
		};

        // TODO validation on paths

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

	checkForSaveFile() {
		let deferred = q.defer();

		// don't reject
		fs.stat(this.saveFile, (err, stats) => {
			if (err) {
				deferred.resolve(false);
			} else {
				deferred.resolve(true);
			}
		});

		return deferred.promise;
	}

	restoreSave(saveFileExists) {
		if (saveFileExists) {
			// Check file before restore
			this.command('restore');
			this.command(this.saveFile);
		}
	}

	writeSave() {
		this.dropAll = true;
		this.command('save');
		this.command(this.saveFile);
		this.command('Y');
		this.command('quit');
		this.command('Y');
		this.command('SI');
	}

	static stripWhiteSpace(str, middle=false, end=false) {
		let temp = str;

		if (end) {
			temp = temp.trim();
		}

		if (middle) {
			temp = temp.replace(/\s{2,}/g, ' ');
		}

		return temp;
	}

	iteration(cmd, cb) {
		let output = '';
		let pError = {};

		cmd = cmd || '';

		this.checkForSaveFile().then((saveFileExists) => {
			let dfrotzArgs =  ['-w', '500', '-h', '999', this.gameImage];
			this.dropAll = saveFileExists;

			this.dfrotz = childProcess.execFile(this.executable, dfrotzArgs, (error, stdout, stdErr) => {
				if (error) {
					pError.error = error;
				}

				if (stdErr) {
					pError.stdErr = stdErr.toString() ? stdErr.toString() : null;
				}

				if (!pError.stdErr && !pError.error) {
					output = output.replace('\r', '').split('\n');

					if (this.outputFilter) {
						output = output.filter(this.outputFilter);
						output[0] = DFrotzInterface.stripWhiteSpace(output[0], true);
					}
				}

				cb(pError, output);

				/*
				 *return {
				 *    output: output,
				 *    error: pError
				 *};
				 */
			});

			this.dfrotz.stdout.on('data', (data) => {
				data = DFrotzInterface.stripWhiteSpace(data.toString(), false, true);

				if (data && !this.dropAll) {
					output += data;
				}
			});

			this.restoreSave(saveFileExists);

			setTimeout(() => {
				this.dropAll = false;

				if (cmd && cmd !== '') {
					this.command(cmd);
				}

				setTimeout(() => {
					this.writeSave();
				}, 100);
			}, 100);
		});
	}
}

module.exports = DFrotzInterface;
