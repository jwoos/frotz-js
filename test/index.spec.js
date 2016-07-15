'use strict';

const colors = require('colors');

const test = () => {
	console.log('A test');
};

colors.setTheme({});

describe('TEST', () => {
	it('should test', () => {
		test();
	});
});
