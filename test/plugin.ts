import pluginTester = require('babel-plugin-tester');

import plugin from '../src/plugin';

pluginTester({
	plugin,
	pluginName: 'flow-to-dts',
	babelOptions: {
		babelrc: false
	},
	tests: {
		'single-line flow directive': {
			code: '// @flow',
			output: ''
		},
		'single-line comment': {
			code: '// Sample comment',
			output: '// Sample comment'
		},
		'multi-line flow directive': {
			code: `
				/**
				 * @flow
				 */
			`,
			output: ''
		},
		'multi-line comment': {
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
		'nullable type': {
			code: 'type NullableType = ?string;',
			output: 'type NullableType = string | null | undefined;'
		},
		'exact object': {
			code: `
				type Exact = {|
				  name: string;
				  age: number;
				|};
			`,
			output: `
				type Exact = {
				  name: string;
				  age: number;
				};
			`
		},
		'exact object with readonly field': {
			code: `
				type Exact = {|
				  +key: boolean;
				|};
			`,
			output: `
				type Exact = {
				  readonly key: boolean;
				};
			`
		},
		'extended object': {
			code: `
				type Extended = {
				  name: string;
				  age: number;
				};
			`,
			output: `
				type Extended = {
				  name: string;
				  age: number;
				  [field: string]: any;
				};
			`
		},
		'extended object with reserved field name': {
			code: `
				type ExtendedReserved = {
				  field: string;
				  value: any;
				};
			`,
			output: `
				type ExtendedReserved = {
				  field: string;
				  value: any;
				  [field: string]: any;
				};
			`
		},
		'extended object with multiple reserved field names': {
			code: `
				type ExtendedReserved = {
				  field: string;
				  other: object;
				};
			`,
			output: `
				type ExtendedReserved = {
				  field: string;
				  other: object;
				  [field: string]: any;
				};
			`
		}
	}
});