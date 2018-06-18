import { Babel, BabelPluginResult } from '@babel/core';
import flowSyntax from '@babel/plugin-syntax-flow';

export default function({ types: t }: Babel): BabelPluginResult {
	return {
		inherits: flowSyntax,
		visitor: {
			NullableTypeAnnotation(path) {
				path.replaceWith(
					t.unionTypeAnnotation([
						path.node.typeAnnotation,
						t.nullLiteralTypeAnnotation(),
						t.genericTypeAnnotation(
							t.identifier('undefined')
						)
					])
				)
			}
		}
	};
}