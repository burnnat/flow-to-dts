import { Babel, BabelPluginResult } from '@babel/core';
import { TypeAlias } from '@babel/types';
import recast from 'recast';

import Converter from './converter';

const FLOW_DIRECTIVE = '@flow';

export default function({ types: t }: Babel): BabelPluginResult {

	const converter = new Converter(t);

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
						converter.convert(node.typeParameters),
						converter.convert(node.right)
					)
				);
			}
		}
	};
}