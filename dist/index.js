'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var q = require('q');

var errors = require('./errors');

var DFrotzInterface = function () {
	function DFrotzInterface(options) {
		_classCallCheck(this, DFrotzInterface);

		options = options || {};

		DFrotzInterface.validateOptions(options);

		var defaults = {
			executable: path.join(__dirname, '/../frotz/dfrotz'),
			gameImage: path.join(__dirname, '/../frotz/data/zork1/DATA/ZORK1.DAT'),
			saveFile: path.join(__dirname, '/../frotz/data/zork1/SAVE/zork1.sav'),
			outputFilter: DFrotzInterface.filter
		};

		this.dfrotz = null;

		this.executable = options.executable || defaults.executable;
		this.gameImage = options.gameImage || defaults.gameImage;
		this.saveFile = options.saveFile || defaults.saveFile;
		this.outputFilter = options.outputFilter || defaults.outputFilter;

		this.dropAll = true;
	}

	_createClass(DFrotzInterface, [{
		key: 'command',
		value: function command(cmd) {
			var timeout = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

			var deferred = q.defer();

			this.dfrotz.stdin.write(cmd + '\n', function () {
				deferred.resolve();
			});

			var promise = deferred.promise;

			if (timeout) {
				promise = deferred.promise.delay(timeout);
			}

			return promise;
		}
	}, {
		key: 'checkForSaveFile',
		value: function checkForSaveFile() {
			var deferred = q.defer();

			// don't reject
			fs.stat(this.saveFile, function (err, stats) {
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
	}, {
		key: 'restoreSave',
		value: function restoreSave(saveFileExists) {
			var toResolve = void 0;

			if (saveFileExists) {
				// Check file before restore
				toResolve = [this.command('restore'), this.command(this.saveFile)];
			} else {
				toResolve = [q()];
			}

			return q.all(toResolve);
		}
	}, {
		key: 'writeSave',
		value: function writeSave() {
			this.dropAll = true;

			var toResolve = [this.command('save'), this.command(this.saveFile), this.command('Y'), this.command('quit'), this.command('Y'), this.command('SI')];

			return q.all(toResolve);
		}
	}, {
		key: 'init',
		value: function init(cb) {
			var _this = this;

			var output = '';
			var dfrotzArgs = ['-w', '500', '-h', '999', this.gameImage];

			this.dfrotz = childProcess.execFile(this.executable, dfrotzArgs, { encoding: 'utf8' }, function (error, stdout, stderr) {
				if (!stderr && !error) {
					output = output.replace('\r', '').split('\n');

					if (_this.outputFilter) {
						output = output.filter(_this.outputFilter);
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

			this.dfrotz.stdout.on('data', function (data) {
				data = DFrotzInterface.stripWhiteSpace(data.toString(), false, true);

				if (data && !_this.dropAll) {
					output += data;
				}
			});
		}
	}, {
		key: 'iteration',
		value: function iteration(cmd, cb) {
			var _this2 = this;

			var save = void 0;

			return this.checkForSaveFile().then(function (saveFileExists) {
				_this2.dropAll = saveFileExists;
				save = saveFileExists;

				_this2.init(cb);

				return q(_this2.dfrotz);
			}).then(function () {
				return _this2.restoreSave(save);
			}).then(function () {
				return q.delay(100);
			}).then(function () {
				_this2.dropAll = false;

				if (cmd) {
					_this2.command(cmd);
				} else {
					throw new errors.DFrotzInterfaceError('A command must be provided');
				}

				return q.delay(100);
			}).then(function () {
				return _this2.writeSave();
			}).catch(function (e) {
				// do something
				console.error(e);
			});
		}
	}], [{
		key: 'filter',
		value: function filter(elem, index, arr) {
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
	}, {
		key: 'stripWhiteSpace',
		value: function stripWhiteSpace(str) {
			var middle = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
			var end = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

			var temp = str;

			if (end) {
				temp = temp.trim();
			}

			if (middle) {
				temp = temp.replace(/\s{2,}/g, ' | ');
			}

			return temp;
		}
	}, {
		key: 'validateOptions',
		value: function validateOptions(options) {
			var fileOptions = ['executable', 'gameImage'];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = fileOptions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _field = _step.value;

					if (!(_field in options)) {
						continue;
					}

					try {
						var stats = void 0;

						stats = fs.statSync(options[_field]);

						if (!stats.isFile()) {
							throw new errors.FileError('Invalid file - ' + options[_field]);
						}
					} catch (e) {
						if (e.name === 'FileError') {
							throw e;
						}

						throw new errors.FileError('Invalid file - ' + e.path);
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var schema = {
				outputFilter: 'function'
			};

			for (var field in schema) {
				if (!(field in options)) {
					continue;
				}

				if (_typeof(options[field]) !== schema[field]) {
					throw new TypeError('Expected type function, got type ' + _typeof(options[field]));
				}
			}
		}
	}]);

	return DFrotzInterface;
}();

module.exports = DFrotzInterface;