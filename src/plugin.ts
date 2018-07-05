import { Babel, BabelPluginResult } from '@babel/core';
import { TypeAlias, DeclareClass, ClassProperty, TSDeclareMethod, Identifier, DeclareModule, DeclareModuleExports, Expression, DeclareTypeAlias, DeclareInterface, TSTypeElement, tsMethodSignature, TSTypeAliasDeclaration } from '@babel/types';
import recast from 'recast';

import createConverters from './convert/convert';

const FLOW_DIRECTIVE = '@flow';

export default function({ types: t }: Babel): BabelPluginResult {
	const { convertType, convertAmbient, convertClasslike } = createConverters(t);

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