'use strict';

class FileError extends Error {
	constructor(message) {
		super(message);

		this.name = 'FileError';
	}
}

class ExecutableError extends Error {
	constructor(message) {
		super(message);

		this.name = 'ExecutableError';
	}
}

class StdoutError extends Error {
	constructor(message) {
		super(message);

		this.name = 'StdoutError';
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
	ExecutableError: ExecutableError,
	StdoutError: StdoutError,
	DFrotzInterfaceError: DFrotzInterfaceError
};
