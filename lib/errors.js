'use strict';

class FSError extends Error {
	constructor(message) {
		super(message);

		this.name = 'FSError';
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
	FSError: FSError,
	ExecutableError: ExecutableError,
	StdoutError: StdoutError,
	DFrotzInterfaceError: DFrotzInterfaceError
};
