import { Babel, BabelPluginResult } from '@babel/core';
import { TypeAlias, DeclareClass, ClassProperty, TSDeclareMethod, Identifier, DeclareModule, DeclareModuleExports, Expression } from '@babel/types';
import recast from 'recast';

import createConverters from './convert/convert';

const FLOW_DIRECTIVE = '@flow';

export default function({ types: t }: Babel): BabelPluginResult {
	const { convertNode, convertExpression } = createConverters(t);

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
						convertNode(node.typeParameters),
						convertNode(node.right)
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
									value.params.map((param) => convertNode(param)),
									t.tsTypeAnnotation(convertNode(value.returnType))
								)
							);
						}
						else {
							members.push(
								t.classProperty(
									property.key,
									null,
									t.tsTypeAnnotation(convertNode(value))
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
			},

			DeclareModule(path) {
				const node: DeclareModule = path.node;

				const result = t.tsModuleDeclaration(
					node.id,
					t.tsModuleBlock(
						node.body.body
					)
				);

				result.declare = true;

				path.replaceWith(result);
			},

			DeclareModuleExports(path) {
				const node: DeclareModuleExports = path.node;
				const typeAnnotation = node.typeAnnotation.typeAnnotation;
				const expression = convertExpression(typeAnnotation);

				if (t.isIdentifier(expression)) {
					path.replaceWith(t.tsExportAssignment(expression));
				}
				else {
					const identifier = t.identifier('_export');

					path.replaceWithMultiple([
						t.tsTypeAliasDeclaration(
							identifier,
							null,
							convertNode(typeAnnotation)
						),
						t.tsExportAssignment(identifier)
					]);
				}
			}
		}
	};
}