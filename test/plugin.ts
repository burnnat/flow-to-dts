import pluginTester = require('babel-plugin-tester');

import plugin from '../src/plugin';

pluginTester({
	plugin,
	pluginName: 'flow-to-dts',
	babelOptions: {
		babelrc: false
	},
	tests: {
		'nullable types': {
			code: 'type NullableType = ?string;',
			output: 'type NullableType = string | null | undefined;'
		}
	}
});