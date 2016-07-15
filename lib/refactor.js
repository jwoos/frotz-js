'use strict';

const fs = require('fs');
const Q = require('q');
const childProcess = require('child_process');
const iconv = require('iconv');

const errors = require('./errors');

class DFrotzInterface {
	constructor(executable, gameImage, saveFile, outputFilter) {
		const defaults = {
			executable: './frotz/dfrotz',
			gameImage: './frotz/data/zork1/DATA/ZORK1.DAT',
			saveFile: './frotz/data/zork1/SAVE/zork1.sav',
			outputFilter: DFrotzInterface.filter
		};

		this.dfrotz = null;

		this.executable = executable || defaults.executable;
		this.gameImage = gameImage || defaults.gameImage;
		this.saveFile = saveFile || defaults.saveFile;
		this.outputFilter = outputFilter || defaults.outputFilter;

		this.encoder = new iconv.Iconv('latin1', 'utf-8');
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

	checkForSaveFile() {
		// don't use below due to rejection and breaking chain
		// return Q.nfcall(fs.stat, this.saveFile);
		let deferred = Q.defer();

		fs.stat(this.saveFile, (err, stat) => {
			if (err) {
				this.saveFileExists = false;
				deferred.resolve(false);
			} else {
				let isFile = stat.isFile();

				if (!isFile) {
					// TODO reject promise and catch it instead of throwing errors here
					throw new errors.FSError('Invalid file type!');
				}

				deferred.resolve(isFile);
			}
		});

		return deferred.promise;
	}

	exec() {
		let dfrotzArgs =  ['-w', '500', '-h', '999', this.gameImage];

		let deferred = Q.defer();

		this.dfrotz = childProcess.exec(this.executable, dfrotzArgs, {cwd: '.', encoding: 'latin1'}, (err, stdout, stderr) => {
			if (err) {
				// TODO reject promise and catch it instead of throwing errors here
				deferred.reject(err);
				//throw new errors.ExecutableError(err);
			}

			if (stderr) {
				// TODO reject promise and catch it instead of throwing errors here
				deferred.reject(stderr);
				//throw new errors.ExecutableError(stderr);
			}

			deferred.resolve(stdout);
		});

		return deferred.promise;
	}

	registerEventListners(output, cb) {
		this.dfrotz.stdout.on('data', (data) => {
			data = this.encoder.convert(data, 'utf8').toString().trim();

			if (data && !this.dropAll) {
				output += data;
			}
		});

		this.dfrotz.on('close', () => {
			output = output.replace('\r', '').split('\n');

			if (this.outputFilter) {
				output = output.filter(this.outputFilter);
			}

			cb(output);
		});
	}

	restore() {
		if (this.saveFileExists) {
			this.command("restore");
			this.command(this.saveFile);
		}
	}

	iteration(cmd, cb) {
		let output, perror;
		cmd = cmd || '';

		this.checkForSaveFile().then((saveFileExists) => {
			this.dropAll = saveFileExists;
			this.saveFileExists = saveFileExists;

			return this.exec();
		}).then((stdout) => {
			this.registerEventListners(output, cb);
			this.restore();

			setTimeout(() => {
				this.dropAll = false;

				if (cmd && cmd !== "") {
					this.command(cmd);
				}

				setTimeout(() => {
					this.dropAll = true
					this.command("save");
					this.command(this.saveFile);
					this.command("Y");
					this.command("quit");
					this.command("Y");
					this.command("SI");
				}, 100);
			}, 100);
		});
	}
}

module.exports = DFrotzInterface;
