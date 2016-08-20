#!/usr/bin/env node
'use strict';

// DON'T USE ES6 FEATURES

const Jasmine = require('jasmine');
const jasmine = new Jasmine();
const specReporter = require('jasmine-spec-reporter');

const args = process.argv.slice(2);

let suite = [
	args.indexOf('unit') > -1 ? 'unit/*.js' : null,
	args.indexOf('integration') > -1 ? 'integration/*.js' : null,
].filter((elem) => {
	return !!elem;
});

jasmine.loadConfig({
	spec_dir: 'test',
	spec_files: suite.length ? suite : [
		'unit/*.js',
		'integration/*.js'
	],
	stopOnExpectationFailure: true,
	random: false
});

jasmine.configureDefaultReporter({
	print: () => {}
});

jasmine.jasmine.getEnv().addReporter(new specReporter({
	displayStacktrace: 'specs',    // display stacktrace for each failed assertion, values: (all|specs|summary|none)
	displayFailuresSummary: true, // display summary of all failures after execution
	displayPendingSummary: true,  // display summary of all pending specs after execution
	displaySuccessfulSpec: true,  // display each successful spec
	displayFailedSpec: true,      // display each failed spec
	displayPendingSpec: true,    // display each pending spec
	displaySpecDuration: false,   // display each spec duration
	displaySuiteNumber: false,    // display each suite number (hierarchical)
	colors: {
		success: 'green',
		failure: 'red',
		pending: 'yellow'
	},
	prefixes: {
		success: '✓ ',
		failure: '✗ ',
		pending: '* '
	},
	customProcessors: []
}));

jasmine.execute();
