import path from 'path';
import pluginTester = require('babel-plugin-tester');

import plugin from '../src/plugin';

pluginTester({
	plugin,
	pluginName: 'flow-to-dts',
	babelOptions: {
		babelrc: false
	},
	fixtures: path.join(__dirname, 'fixtures')
});