'use strict';

const path = require('path');

const errors = require(path.join(__dirname, '../../dist/errors.js'));

describe('Class: FileError', () => {
	describe('Method: constructor', () => {
		it('should extend error', () => {
			let error = new errors.FileError('Test message');

			expect(error instanceof Error).toEqual(true);
			expect(error.name).toEqual('FileError');
			expect(error.message).toEqual('Test message');
			expect(error.toString()).toEqual('FileError: Test message');
		});
	});
});

describe('Class: DFrotzInterfaceError', () => {
	describe('Method: constructor', () => {
		it('should extend error', () => {
			let error = new errors.DFrotzInterfaceError('Test message');

			expect(error instanceof Error).toEqual(true);
			expect(error.name).toEqual('DFrotzInterfaceError');
			expect(error.message).toEqual('Test message');
			expect(error.toString()).toEqual('DFrotzInterfaceError: Test message');
		});
	});
});
