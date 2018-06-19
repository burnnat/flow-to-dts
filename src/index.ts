import * as babel from '@babel/core';

import plugin from './plugin';

export default function transform(input: string, callback: (err: Error | null, output: string | null) => void) {
	babel.transform(
		input,
		{
			babelrc: false,
			plugins: [
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