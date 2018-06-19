import { Babel, BabelPluginResult } from '@babel/core';
import { Comment } from '@babel/types';
import flowSyntax from '@babel/plugin-syntax-flow';

const FLOW_DIRECTIVE = '@flow';

export default function({ types: t }: Babel): BabelPluginResult {
	return {
		inherits: flowSyntax,
		visitor: {
			File(path) {
				const comments = path.node.comments;

				for (const comment of comments) {
					if (comment.value.includes(FLOW_DIRECTIVE)) {
						// strip flow directive
						comment.value = comment.value.replace(FLOW_DIRECTIVE, '');

						// remove the comment completely if it only consists of whitespace and/or stars
						if (!comment.value.replace(/\*/g, '').trim()) {
							comment.ignore = true;
						}
					}
				}
			},

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