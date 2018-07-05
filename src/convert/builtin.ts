import { BabelTypes } from '@babel/core';

import Imports from '../util/imports';
import { GenericTypeAnnotation, TSTypeParameterInstantiation } from '@babel/types';

export type ConvertBuiltin = ReturnType<typeof createConverter>;

interface TypeMap {
	[key: string]: [
		string, // module name
		string  // import name
	];
}

const types: TypeMap = {
	'events$EventEmitter': ['events', 'EventEmitter'],
	'http$ClientRequest': ['http', 'ClientRequest']
}

export default function createConverter(t: BabelTypes, imports: Imports) {
	function convert(node: GenericTypeAnnotation, typeParams: TSTypeParameterInstantiation | null) {
		const tuple = types[node.id.name];

		if (!tuple) {
			return null;
		}

		const name = imports.require(tuple[0], tuple[1]);

		const result = t.tsTypeReference(t.identifier(name));
		result.typeParameters = typeParams;

		return result;
	}

	return convert;
}