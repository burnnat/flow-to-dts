declare module '@babel/core' {
	interface TransformOptions {

	}

	interface TransformResults {
		code: string;
		map: any;
		ast: object;
	}

	export function transform(code: string, callback: () => void): void;
	export function transform(code: string, options: TransformOptions, callback: (err: Error, result: TransformResults) => void): void;

	import babelTypes from '@babel/types';
	export const types: typeof babelTypes;
}
