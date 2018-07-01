import * as babel from '@babel/core';

import plugin from './plugin';

export default function transform(input: string): Promise<string> {
	return new Promise((resolve, reject) => {
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
					reject(err);
				}
				else {
					resolve(result.code);
				}
			}
		);
	});
}