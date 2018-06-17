import typesModule from '@babel/types';
export type BabelTypes = typeof typesModule;

import { Node } from '@babel/types';

import babelModule from '@babel/core';
export type Babel = typeof babelModule;

type State = any;

export interface BabelPluginResult {
	pre?(state: State): void;
	post?(state: State): void;

	visitor: {
		[key in Node['type']]?: (path: any, state: State) => void
	};
}

export type BabelPlugin = (babel: Babel) => BabelPluginResult;