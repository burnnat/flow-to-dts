import { Babel, BabelPluginResult } from './babel';

export default function({ types: t }: Babel): BabelPluginResult {
	return {
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