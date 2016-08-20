'use strict';

const fs = require('fs');
const path = require('path');

const bluebird = require('bluebird');
const childProcess = require('child_process');

const DFrotzInterface = require('../index');

describe('Unit Test |', () => {
	describe('Class: DFrotzInterface', () => {
		describe('Method: constructor', () => {
			beforeEach(() => {
				spyOn(DFrotzInterface, 'validateOptions');
				spyOn(path, 'join').and.callThrough();
			});

			it('should set options by default', () => {
				let frotz = new DFrotzInterface();

				expect(DFrotzInterface.validateOptions).toHaveBeenCalled();

				expect(path.join).toHaveBeenCalledTimes(3);

				let executablePath = path.parse(frotz.executable);
				expect(executablePath).toEqual(jasmine.objectContaining({
					root: '/',
					base: 'dfrotz',
					ext: '',
					name: 'dfrotz'
				}));
				expect(executablePath.dir.split('/')).toEqual(jasmine.arrayContaining([
					'javascript_frotz',
					'frotz'
				]));

				let gameImagePath = path.parse(frotz.gameImage);
				expect(gameImagePath).toEqual(jasmine.objectContaining({
					root: '/',
					base: 'ZORK1.DAT',
					ext: '.DAT',
					name: 'ZORK1'
				}));
				expect(gameImagePath.dir.split('/')).toEqual(jasmine.arrayContaining([
					'javascript_frotz',
					'frotz',
					'data',
					'zork1',
					'DATA'
				]));

				let saveFilePath = path.parse(frotz.saveFile);
				expect(saveFilePath).toEqual(jasmine.objectContaining({
					root: '/',
					base: 'zork1.sav',
					ext: '.sav',
					name: 'zork1'
				}));
				expect(saveFilePath.dir.split('/')).toEqual(jasmine.arrayContaining([
					'javascript_frotz',
					'frotz',
					'data',
					'zork1',
					'SAVE'
				]));

				expect(frotz.outputFilter).toEqual(DFrotzInterface.filter);
				expect(frotz.dropAll).toEqual(true);
			});

			it('should take in options to override defaults', () => {
				let mockFilter = () => {};

				let frotz = new DFrotzInterface({
					executable: 'test/executable',
					gameImage: 'test/gameImage',
					saveFile: 'test/save',
					outputFilter: mockFilter
				});

				expect(DFrotzInterface.validateOptions).toHaveBeenCalled();
				expect(frotz.executable).toEqual('test/executable');
				expect(frotz.gameImage).toEqual('test/gameImage');
				expect(frotz.saveFile).toEqual('test/save');
				expect(frotz.outputFilter).toEqual(mockFilter);
				expect(frotz.dropAll).toEqual(true);
			});
		});

		describe('Method: filter', () => {
			it('should filter string starting with >', () => {
				let arr = [
					'first',
					'second',
					'>third',
				];

				let result = arr.filter(DFrotzInterface.filter);

				expect(result).toEqual([
					'first',
					'second'
				]);
			});

			it('should filter out empty strings', () => {
				let arr = [
					'',
					'',
					'',
					''
				];

				expect(arr.filter(DFrotzInterface.filter)).toEqual([]);
			});

			it('should keep the first elem if length is three', () => {
				let arr = [
					'first',
					'',
					''
				];

				expect(arr.filter(DFrotzInterface.filter)).toEqual([
					'first'
				]);
			});
		});

		describe('Method: stripWhiteSpace', () => {
			it('should strip whitespace', () => {
				let str = '  asdasd    asdasd qeq';

				let result = DFrotzInterface.stripWhiteSpace(str, true, true);

				expect(result).toEqual('asdasd | asdasd qeq');
			});

			it('should do nothing if no arguments are specified', () => {
				let str = '               asd ';
				let result = DFrotzInterface.stripWhiteSpace(str);

				expect(str).toEqual(result);
			});

			it('should only do outer', () => {
				let str = '   asd   asd   ';
				let result = DFrotzInterface.stripWhiteSpace(str, false, true);

				expect(result).toEqual('asd   asd');
			});
		});

		describe('Method: validateOptions', () => {
			it('should not do anything for default params', () => {
				spyOn(fs, 'statSync');
				DFrotzInterface.validateOptions({});

				expect(fs.statSync).not.toHaveBeenCalled();
			});

			it('should throw an error if directory', () => {
				spyOn(fs, 'statSync').and.returnValues({
					isFile: () => false
				});

				expect(() => {
					DFrotzInterface.validateOptions({
						executable: 'test'
					});

					expect(fs.statSync).toHaveBeenCalled();
				}).toThrowError(Error, 'Invalid file - test');
			});

			it('should throw error if invalid path', () => {
				spyOn(fs, 'statSync').and.callFake(() => {
					let e = new Error('');
					e.path = 'test';

					throw e;
				});

				expect(() => {
					DFrotzInterface.validateOptions({
						executable: 'test'
					});

					expect(fs.statSync).toHaveBeenCalled();
				}).toThrowError(Error, 'Invalid file - test');
			});

			it('should skip saveFile', () => {
				spyOn(fs, 'statSync');

				DFrotzInterface.validateOptions({
					saveFile: './test.sav'
				});

				expect(fs.statSync).not.toHaveBeenCalled();
			});

			it('should throw error if outputFilter is not a function', () => {
				expect(() => {
					DFrotzInterface.validateOptions({
						outputFilter: 'string'
					});
				}).toThrowError(TypeError, 'Expected type function, got type string');
			});
		});

		describe('Method: command', () => {
			let frotz;

			beforeEach(() => {
				frotz = new DFrotzInterface();
				frotz.dfrotz = {
					stdin: {
						write: () => {}
					}
				};

				spyOn(frotz.dfrotz.stdin, 'write');
			});

			it('should write to stdin', () => {
				frotz.command('a command');

				expect(frotz.dfrotz.stdin.write).toHaveBeenCalled();
			});

			it('should work with promises', () => {
				spyOn(bluebird.prototype, 'delay').and.callThrough();

				let promise = frotz.command('command');

				expect(bluebird.prototype.delay).toHaveBeenCalledWith(10);
				expect(promise instanceof bluebird).toEqual(true);
				expect(promise.isPending()).toEqual(true);
			});
		});

		describe('Method: checkForSaveFile', () => {
			let frotz;

			beforeEach(() => {
				frotz = new DFrotzInterface();
			});

			it('should return a promise', () => {
				let promise = frotz.checkForSaveFile();

				expect(promise instanceof bluebird).toEqual(true);
			});

			it('should always resolve', () => {
				frotz.saveFile = 'asdasdas/dasdasd';

				frotz.checkForSaveFile().then((val) => {
					expect(val).toEqual(false);
				});

				frotz.saveFile = './';

				frotz.checkForSaveFile().then((val) => {
					expect(val).toEqual(true);
				});
			});
		});

		describe('Method: restoreSave', () => {
			let frotz;

			beforeEach(() => {
				frotz = new DFrotzInterface();
				frotz.saveFile = './';

				spyOn(frotz, 'command');
				spyOn(bluebird, 'all').and.callThrough();
			});

			it('should call restore', () => {
				frotz.restoreSave(true);

				expect(frotz.command).toHaveBeenCalledTimes(2);
				expect(frotz.command).toHaveBeenCalledWith('restore');
				expect(frotz.command).toHaveBeenCalledWith('./');
			});

			it('should return a promise', () => {
				let result = frotz.restoreSave();

				expect(result.then).not.toBeNull();
			});

			it('should consolidate promises', () => {
				frotz.restoreSave();

				expect(bluebird.all).toHaveBeenCalled();
			});
		});

		describe('Method: writeSave', () => {
			let frotz;

			beforeEach(() => {
				frotz = new DFrotzInterface();
				frotz.saveFile = './';

				spyOn(frotz, 'command');
				spyOn(bluebird, 'all').and.callThrough();
			});

			it('should return a promise', () => {
				let result = frotz.writeSave();

				expect(result.then).not.toBeNull();
			});

			it('should call commands', () => {
				frotz.writeSave();

				expect(frotz.command).toHaveBeenCalledTimes(6);

				for (let cmd of ['save', './', 'Y', 'quit', 'Y', 'SI']) {
					expect(frotz.command).toHaveBeenCalledWith(cmd);
				}
			});

			it('should consolidate promises', () => {
				frotz.writeSave();

				expect(bluebird.all).toHaveBeenCalled();
			});
		});

		describe('Method: init', () => {
			let frotz;
			let stdout;
			let mockFunction;

			beforeEach(() => {
				frotz = new DFrotzInterface();

				mockFunction = () => {};

				stdout = {
					on: mockFunction
				};

				spyOn(stdout, 'on').and.callThrough();
				spyOn(childProcess, 'execFile').and.returnValues({
					stdout: stdout
				});
			});

			//spyOn(frotz.dfrotz.stdout, 'on');
			it('should initialize dfrotz and set it', () => {
				frotz.init(() => {});

				expect(frotz.dfrotz).toEqual({
					stdout: stdout
				});
			});

			it('should attach an event listener', () => {
				frotz.init(() => {});

				expect(stdout.on).toHaveBeenCalled();
			});
		});

		xdescribe('Method: iteration', () => {
			let frotz, mockFunction, mockDefers;

			beforeEach(() => {
				frotz = new DFrotzInterface();
				mockFunction = () => {};
				mockDefers = {
					checkForSaveFile: bluebird.defer(),
					restoreSave: bluebird.defer()
				};

				spyOn(frotz, 'checkForSaveFile').and.returnValues(mockDefers.checkForSaveFile.promise);
				spyOn(frotz, 'init');
				spyOn(frotz, 'restoreSave').and.returnValues(mockDefers.restoreSave.promise);
				spyOn(frotz, 'command');
				spyOn(frotz, 'writeSave');
				spyOn(bluebird, 'delay').and.callThrough();
			});

			it('should iterate', (done) => {
				let result = frotz.iteration('look', mockFunction);
				let saveFileExists = true;

				result.then(() => {
					expect(frotz.checkForSaveFile).toHaveBeenCalled();
					expect(frotz.init).toHaveBeenCalledWith(mockFunction);
					expect(frotz.restoreSave).toHaveBeenCalledWith(saveFileExists);
					expect(bluebird.delay).toHaveBeenCalledWith(100);
					expect(frotz.command).toHaveBeenCalledWith('look');
					expect(frotz.writeSave).toHaveBeenCalled();

					done();
				});

				mockDefers.checkForSaveFile.resolve(saveFileExists);
				mockDefers.restoreSave.resolve();
			});

			it('should throw error if no command', (done) => {
				frotz.iteration('', mockFunction);
				let saveFileExists = true;

				mockDefers.checkForSaveFile.resolve(saveFileExists);
				mockDefers.restoreSave.resolve();

				expect(frotz.checkForSaveFile).toHaveBeenCalled();
				expect(frotz.init).toHaveBeenCalledWith(mockFunction);
				expect(frotz.restoreSave).toHaveBeenCalledWith(saveFileExists);
				expect(bluebird.delay).toHaveBeenCalledWith(100);
				expect(frotz.command).toHaveBeenCalledWith('look');
				expect(frotz.writeSave).toHaveBeenCalled();

				done();
			});
		});
	});
});
