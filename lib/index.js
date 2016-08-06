'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const q = require('q');
const kue = require('kue');

const errors = require('./errors');

class DFrotzInterface {
	constructor(options) {
		options = options || {};

		DFrotzInterface.validateOptions(options);

		const defaults = {
			executable: path.join(__dirname, '/../frotz/dfrotz'),
			gameImage: path.join(__dirname, '/../frotz/data/zork1/DATA/ZORK1.DAT'),
			saveFile: path.join(__dirname, '/../frotz/data/zork1/SAVE/zork1.sav'),
			outputFilter: DFrotzInterface.filter,
			kueConfig: process.env.NODE_ENV === 'production' ? {redis: {process.env.REDIS_HOST, host: process.env.REDIS_HOST, auth: process.env.REDIS_PASS}} : {}
		};

		this.dfrotz = null;

		this.executable = options.executable || defaults.executable;
		this.gameImage = options.gameImage || defaults.gameImage;
		this.saveFile = options.saveFile || defaults.saveFile;
		this.outputFilter = options.outputFilter || defaults.outputFilter;
		this.kueConfig = options.kueConfig || defaults.kueConfig;

		this.dropAll = true;

	}

	static filter(elem, index, arr) {
		if (arr.length === 3 && index === 0) {
			return true;
		}

		if (!elem) {
			return false;
		}

		if (elem[0] === '>') {
			return false;
		}

		return true;
	}

	static stripWhiteSpace(str, middle=false, end=false) {
		let temp = str;

		if (end) {
			temp = temp.trim();
		}

		if (middle) {
			temp = temp.replace(/\s{2,}/g, ' | ');
		}

		return temp;
	}

	static validateOptions(options) {
		const fileOptions = ['executable', 'gameImage'];

		for (let opt in fileOptions) {
			try {
				let stats = fs.statSync(options[opt]);
			} catch (e) {
				if (e.name === 'FileError') {
					throw e;
				}

				throw new errors.FileError(`Invalid file - ${e.path}`);
			}

			if (!stats.isFile()) {
				throw new errors.FileError(`Invalid file - ${options[opt]}`);
			}
		}

		const schema = {
			outputFilter: 'function',
			kueConfig: 'object'
		}

		for (let field in schema) {
			if (options[field] && typeof options[field] !== schema[field]) {
				throw new TypeError(`Expected type function, got type ${typeof options[field]}`);
			}
		}
	}

	command(cmd, timeout=10) {
		let deferred = q.defer();

		this.dfrotz.stdin.write(`${cmd}\n`, () => {
			deferred.resolve();
		});

		let promise = deferred.promise;

		if (timeout) {
			promise = deferred.promise.delay(timeout);
		}

		return promise;
	}

	checkForSaveFile() {
		let deferred = q.defer();

		// don't reject
		fs.stat(this.saveFile, (err, stats) => {
			if (err) {
				deferred.resolve(false);
			} else {
				// TODO handle this better
				if (!stats.isFile()) {
					deferred.reject();
				}

				deferred.resolve(true);
			}
		});

		return deferred.promise;
	}

	restoreSave(saveFileExists) {
		let toResolve;

		if (saveFileExists) {
			// Check file before restore
			toResolve = [
				this.command('restore'),
				this.command(this.saveFile)
			];
		} else {
			toResolve = [
				q()
			];
		}

		return q.all(toResolve);
	}

	writeSave() {
		this.dropAll = true;

		let toResolve = [
			this.command('save'),
			this.command(this.saveFile),
			this.command('Y'),
			this.command('quit'),
			this.command('Y'),
			this.command('SI')
		];

		return q.all(toResolve);
	}

	init(cb) {
		let output = '';
		let dfrotzArgs =  ['-w', '500', '-h', '999', this.gameImage];

		this.dfrotz = childProcess.execFile(this.executable, dfrotzArgs, {encoding: 'utf8'}, (error, stdout, stderr) => {
			if (!stderr && !error) {
				output = output.replace('\r', '').split('\n');

				if (this.outputFilter) {
					output = output.filter(this.outputFilter);
					output[0] = DFrotzInterface.stripWhiteSpace(output[0], true);
				}
			}

			cb({
				stderr: stderr,
				error: error
			}, {
				pretty: output,
				full: stdout
			});
		});

		this.dfrotz.stdout.on('data', (data) => {
			data = DFrotzInterface.stripWhiteSpace(data.toString(), false, true);

			if (data && !this.dropAll) {
				output += data;
			}
		});
	}

	initializeQueue() {
		if (this.queue) return;

		this.queue = kue.createQueue(this.kueConfig);

		this.queue.process(this.saveFile, (job, done) => {
			run(job.data.cmd, job.data.cb);
		});
	}

	run(cmd, cb) {
		let save;

		return this.checkForSaveFile()
			.then((saveFileExists) => {
				this.dropAll = saveFileExists;
				save = saveFileExists;

				this.init(cb);

				return q(this.dfrotz);
			}).then(() => {
				return this.restoreSave(save);
			}).then(() => {
				return q.delay(100);
			}).then(() => {
				this.dropAll = false;

				if (cmd) {
					this.command(cmd);
				} else {
					throw new errors.DFrotzInterfaceError('A command must be provided');
				}

				return q.delay(100);
			}).then(() => {
				return this.writeSave();
			}).catch((e) => {
				// do something
				console.error(e);
			});
	}

	iteration(cmd, cb) {
		this.queue.create(this.saveFile, {
			cb: cb,
			cmd: cmd
		});
	}
}

module.exports = DFrotzInterface;
