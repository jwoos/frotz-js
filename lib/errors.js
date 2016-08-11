'use strict';

class FileError extends Error {
	constructor(message) {
		super(message);

		this.name = 'FileError';
	}
}

class DFrotzInterfaceError extends Error {
	constructor(message) {
		super(message);

		this.name = 'StdoutError';
	}
}

module.exports = {
	FileError: FileError,
	DFrotzInterfaceError: DFrotzInterfaceError
};
