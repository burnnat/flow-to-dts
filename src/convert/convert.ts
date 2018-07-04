import { Node as BabelNode } from '@babel/types';
import { BabelTypes } from '@babel/core';

import createAmbientConverter from './ambient';
import createTypeConverter from './type';
import createClasslikeConverter from './classlike';

export type Convert<T extends BabelNode, O> = (node: T) => O;

export interface ConverterMap {
	[type: string]: Convert<any, any>;
}

class ConverterError extends Error {

}

export function convertInternal<T>(node: BabelNode | null, converters: ConverterMap): T | null {
	if (!node) {
		return null;
	}
	else {
		const type = node.type;
		const converter: Convert<BabelNode, T> = converters[type];

		try {
			if (!converter) {
				throw new Error('No converter exists for node type: ' + type);
			}
			else {
				return converter(node);
			}
		}
		catch (err) {
			const loc = node.loc;

			if (loc && !(err instanceof ConverterError)) {
				const prefix = loc ? `[${loc.start.line}:${loc.start.column}] ` : '';
				const errMessage = err instanceof Error ? err.stack || err.message : err;
				throw new ConverterError(prefix + errMessage);
			}
			else {
				throw err;
			}
		}
	}
}

export function addConverter<T extends BabelNode, O>(parent: Convert<T, O>, converters: ConverterMap, type: T['type'], worker: Convert<T, O>) {
	converters[type] = worker;
}

export default function createConverters(t: BabelTypes) {
	return {
		convertAmbient: createAmbientConverter(t),
		convertType: createTypeConverter(t),
		convertClasslike: createClasslikeConverter(t)
	};
}