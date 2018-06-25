import { Babel, BabelPluginResult } from '@babel/core';
import { TypeAlias, DeclareClass, ClassProperty, TSDeclareMethod, Identifier } from '@babel/types';
import recast from 'recast';

import createConverter from './convert';

const FLOW_DIRECTIVE = '@flow';

export default function({ types: t }: Babel): BabelPluginResult {
	const convert = createConverter(t);

	return {
		parserOverride: (
			code: string,
			options: any,
			parse: (code: string, options: any) => any
		) => recast.parse(code, {
			parser: {
				parse(code: string) {
					return parse(code, {
						sourceType: 'module',
						allowImportExportEverywhere: true,
						allowReturnOutsideFunction: true,
						allowSuperOutsideMethod: true,
						plugins: ['flow']
					});
				}
			}
		}),

		generatorOverride: (ast: object) => recast.print(ast, { flowObjectCommas: false }),

		visitor: {
			Program(path) {
				const comments = path.node.comments;

				if (!comments) {
					return;
				}

				for (const comment of comments) {
					let value = comment.value;

					if (value.includes(FLOW_DIRECTIVE)) {
						// strip flow directive
						comment.value = value.replace(FLOW_DIRECTIVE, '');
					}
				}
			},

			TypeAlias(path) {
				const node: TypeAlias = path.node;

				path.replaceWith(
					t.tsTypeAliasDeclaration(
						node.id,
						convert(node.typeParameters),
						convert(node.right)
					)
				);
			},

			DeclareClass(path) {
				const node: DeclareClass = path.node;

				const members: (ClassProperty | TSDeclareMethod)[] = [];

				node.body.properties.forEach((property) => {
					if (t.isObjectTypeProperty(property)) {
						const value = property.value;

						if (t.isFunctionTypeAnnotation(value) && (property as any).method) {
							members.push(
								t.tsDeclareMethod(
									null,
									property.key,
									null,
									value.params.map((param) => convert(param)),
									t.tsTypeAnnotation(convert(value.returnType))
								)
							);
						}
						else {
							members.push(
								t.classProperty(
									property.key,
									null,
									t.tsTypeAnnotation(convert(value))
								)
							)
						}
					}
				});

				const result = t.classDeclaration(
					node.id,
					null,
					t.classBody(members)
				);

				result.declare = true;

				path.replaceWith(result);
			}
		}
	};
}