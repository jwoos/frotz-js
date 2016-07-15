'use strict';

class ExecutableError extends Error {
	constructor(message) {
		super(message);

		this.name = 'ExecutableError';
	}
}

module.exports = {
	ExecutableError: ExecutableError
};
