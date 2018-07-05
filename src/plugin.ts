import { Babel, BabelPluginResult } from '@babel/core';
import { TypeAlias, DeclareClass, ClassProperty, TSDeclareMethod, Identifier, DeclareModule, DeclareModuleExports, Expression, DeclareTypeAlias, DeclareInterface, TSTypeElement, tsMethodSignature, TSTypeAliasDeclaration, ImportDeclaration } from '@babel/types';
import recast from 'recast';

import createConverters from './convert/convert';
import Imports from './util/imports';

const FLOW_DIRECTIVE = '@flow';

export default function({ types: t }: Babel): BabelPluginResult {
	const imports = new Imports();
	const { convertType, convertAmbient, convertClasslike } = createConverters(t, imports);

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
			Program: {
				enter(path) {
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

				exit(path) {
					imports.getImportsToAdd().forEach((spec) => {
						const node = t.importDeclaration(
							spec.members.map(
								(member) => t.importSpecifier(
									t.identifier(member.local),
									t.identifier(member.import)
								)
							),
							t.stringLiteral(spec.module)
						);

						path.unshiftContainer('body', node);
					});
				}
			},

			ImportDeclaration(path) {
				const node: ImportDeclaration = path.node;
				const module = node.source.value;

				node.specifiers.forEach((specifier) => {
					let imported: string;
					let local: string;

					if (t.isImportSpecifier(specifier)) {
						imported = specifier.imported.name;
						local = specifier.local.name;
					}
					else if (t.isImportDefaultSpecifier(specifier)) {
						imported = 'default';
						local = specifier.local.name;
					}
					else {
						imported = '';
						local = specifier.local.name;
					}

					imports.register(module, imported, local);
				});
			},

			TypeAlias(path) {
				const node: TypeAlias = path.node;

				path.replaceWith(
					t.tsTypeAliasDeclaration(
						node.id,
						convertType(node.typeParameters),
						convertType(node.right)
					)
				);
			},

			DeclareClass(path) {
				const result = convertClasslike(path.node as DeclareClass);
				result.declare = true;

				path.replaceWith(result);
			},

			DeclareInterface(path) {
				const result = convertClasslike(path.node as DeclareInterface);
				result.declare = true;

				path.replaceWith(result);
			},

			DeclareModule(path) {
				const node: DeclareModule = path.node;

				const result = t.tsModuleDeclaration(
					node.id,
					t.tsModuleBlock(
						convertAmbient(node.body.body)
					)
				);

				result.declare = true;

				path.replaceWith(result);
			},

			DeclareModuleExports(path) {
				path.replaceWithMultiple(
					convertAmbient([path.node])
				);
			},

			DeclareTypeAlias(path) {
				const result = convertAmbient([path.node]);
				(result[0] as TSTypeAliasDeclaration).declare = true;

				path.replaceWithMultiple(result);
			}
		}
	};
}