import * as babel from '@babel/core';

import plugin from './plugin';

export function transform(code: string): Promise<string> {
	return new Promise((resolve, reject) => {
		babel.transform(
			code,
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

export function transformAst(ast: object): Promise<object> {
	return new Promise((resolve, reject) => {
		babel.transformFromAst(
			ast,
			null,
			{
				ast: true,
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
					resolve(result.ast);
				}
			}
		);
	})
};
