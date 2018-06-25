import { Node as BabelNode } from '@babel/types';
import { BabelTypes } from '@babel/core';

import createNodeConverter from './node';
import createExpressionConverter from './expression';

export type Convert<T extends BabelNode, O extends BabelNode> = (node: T) => O;

export interface ConverterMap {
	[type: string]: Convert<any, any>;
}

export function convertInternal(node: BabelNode | null, converters: ConverterMap): BabelNode | null {
	if (!node) {
		return null;
	}
	else {
		const type = node.type;
		const converter: Convert<BabelNode, BabelNode> = converters[type];

		if (!converter) {
			const loc = node.loc;
			const prefix = loc ? `[${loc.start.line}:${loc.start.column}] ` : '';
			throw new Error(prefix + 'No converter exists for node type: ' + type)
		}
		else {
			return converter(node);
		}
	}
}

export function addConverter<T extends BabelNode, O extends BabelNode>(parent: Convert<T, O>, converters: ConverterMap, type: T['type'], worker: Convert<T, O>) {
	converters[type] = worker;
}

export default function createConverters(t: BabelTypes) {
	return {
		convertNode: createNodeConverter(t),
		convertExpression: createExpressionConverter(t)
	}
}