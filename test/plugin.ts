import pluginTester = require('babel-plugin-tester');

import plugin from '../src/plugin';

pluginTester({
	plugin,
	pluginName: 'flow-to-dts',
	babelOptions: {
		babelrc: false
	},
	tests: {
		'strip single-line flow directive': {
			code: '// @flow',
			output: ''
		},
		'preserve single-line comments': {
			code: '// Sample comment',
			output: '// Sample comment'
		},
		'strip multi-line flow directive': {
			code: `
				/**
				 * @flow
				 */
			`,
			output: ''
		},
		'preserve multi-line comments': {
			code: `
				/**
				 * Sample comment
				 */
			`,
			output: `
				/**
				 * Sample comment
				 */
			`
		},
		'nullable types': {
			code: 'type NullableType = ?string;',
			output: 'type NullableType = string | null | undefined;'
		}
	}
});