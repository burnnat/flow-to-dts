declare module '@babel/core' {
	import typesModule from '@babel/types';
	export type BabelTypes = typeof typesModule;

	import { Node } from '@babel/types';

	type State = any;

	export interface BabelPluginResult {
		pre?(state: State): void;
		post?(state: State): void;

		inherits?: BabelPlugin,

		visitor: {
			[key in Node['type']]?: (path: any, state: State) => void
		};
	}

	export type BabelPlugin = (babel: Babel) => BabelPluginResult;

	interface TransformOptions {

	}

	interface TransformResults {
		code: string;
		map: any;
		ast: object;
	}

	export interface Babel {
		types: BabelTypes;
	}

	export function transform(code: string, callback: () => void): void;
	export function transform(code: string, options: TransformOptions, callback: (err: Error, result: TransformResults) => void): void;
	export const types: BabelTypes;
}

declare module '@babel/plugin-syntax-flow' {
	import { BabelPlugin } from '@babel/core';
	const flowSyntax: BabelPlugin;

	export default flowSyntax;
}

declare module 'babel-plugin-tester' {
	import { BabelPlugin } from '@babel/core';

	interface TestObject {
		code: string;
		title?: string;
		output?: string;

		only?: boolean;
		skip?: boolean;
	}

	type TestDescriptor = TestObject | string;

	interface TestOptions {
		plugin: BabelPlugin;
		pluginName?: string;
		babelOptions?: object;
		tests: { [name: string]: TestDescriptor } | TestDescriptor[];
	}

	function BabelPluginTester(options: TestOptions): void;
	export = BabelPluginTester;
}