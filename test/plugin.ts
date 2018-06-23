import path from 'path';
import pluginTester = require('babel-plugin-tester');

import plugin from '../src/plugin';

pluginTester({
	plugin,
	pluginName: 'flow-to-dts',
	title: 'code sample',
	babelOptions: {
		babelrc: false
	},
	fixtures: path.join(__dirname, 'fixtures', 'sample')
});

pluginTester({
	plugin,
	pluginName: 'flow-to-dts',
	title: 'third party',
	babelOptions: {
		babelrc: false
	},
	fixtures: path.join(__dirname, 'fixtures', 'third-party'),
	snapshot: true
});