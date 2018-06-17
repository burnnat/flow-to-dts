import * as babel from '@babel/core';

import plugin from './plugin';

export default function transform(input: string, callback: (err: Error | null, output: string | null) => void) {
	babel.transform(
		input,
		{
			babelrc: false,
			plugins: [
				'@babel/plugin-syntax-flow',
				plugin
			]
		},
		(err, result) => {
			if (err) {
				callback(err, null);
			}
			else {
				callback(null, result.code);
			}
		}
	);
}