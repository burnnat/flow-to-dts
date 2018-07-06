declare module '@babel/core' {
	import typesModule from '@babel/types';
	export type BabelTypes = typeof typesModule;

	import { Node } from '@babel/types';

	type State = any;

	interface Path<N> {
		node: N,
		get<K extends keyof N>(key: K): Path<N[K]>; 
		replaceWith(node: Node): void;
		replaceWithMultiple(nodes: Node[]): void;
		unshiftContainer(key: string, node: Node): void;
		pushContainer(key: string, node: Node): void;
	}

	type VisitorFn<N> = (path: Path<N>, state: State) => void;

	interface VisitorObj<N> {
		enter?: VisitorFn<N>,
		exit?: VisitorFn<N>
	}

	type Visitor<N> = VisitorFn<N> | VisitorObj<N>;

	// See https://stackoverflow.com/questions/50125893/typescript-derive-map-from-discriminated-union
	type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;
	type VisitorMap<T extends Record<K, string>, K extends keyof T> = {
		[V in T[K]]?: Visitor<DiscriminateUnion<T, K, V>>
	}

	export interface BabelPluginResult {
		pre?(state: State): void;
		post?(state: State): void;

		inherits?: BabelPlugin;

		parserOverride?: any;
		generatorOverride?: any;

		visitor: VisitorMap<Node, 'type'>;
	}

	export type BabelPlugin = (babel: Babel) => BabelPluginResult;

	interface TransformOptions {

	}

	interface TransformResults {
		code: string;
		map: any;
		ast: object;
	}

	type TransformCallback = (err: Error, result: TransformResults) => void;

	export interface Babel {
		types: BabelTypes;
	}

	export function transform(code: string, callback: () => void): void;
	export function transform(code: string, options: TransformOptions, callback: TransformCallback): void;
	export function transformFromAst(ast: object, code: string | null, options: TransformOptions, callback: TransformCallback): void;

	export const types: BabelTypes;
}

declare module 'babel-plugin-tester' {
	import { BabelPlugin } from '@babel/core';

	interface TestOptions {
		title?: string;
		output?: string;
		outputFixture?: string;

		only?: boolean;
		skip?: boolean;
		snapshot?: boolean;

		setup?: () => Promise<void> | void;
		teardown?: () => Promise<void> | void;
	}

	type RequiredTestOptions = { code: string } | { fixture: string };
	type TestDescriptor = TestOptions & RequiredTestOptions | string;

	interface TesterOptions extends TestOptions {
		plugin: BabelPlugin;
		pluginName?: string;
		title?: string;
		babelOptions?: object;
		filename?: string;
		tests?: { [name: string]: TestDescriptor } | TestDescriptor[];
		fixtures?: string;
	}

	function BabelPluginTester(options: TesterOptions): void;
	export = BabelPluginTester;
}

declare module 'recast' {
	export function parse(code: string, options?: object): object;
	export function print(ast: object, options?: object): string;
}

declare module "*.json" {
	const value: any;
	export default value;
}

declare module 'test-cli' {
	export default function run(cli: () => void, ...args: string[]): void;
}

declare module 'fsify' {
	function fsify(options: object): (structure: any) => Promise<any>;
	
	namespace fsify {
		export const FILE: any;
		export const DIRECTORY: any;
	}

	export = fsify;
}