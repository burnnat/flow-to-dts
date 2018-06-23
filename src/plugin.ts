import { Babel, BabelPluginResult } from '@babel/core';
import { Node as BabelNode, BooleanTypeAnnotation } from '@babel/types';
import { TypeParameterDeclaration, TypeParameter, TypeAlias, FlowType, TSType, TSTypeElement, ObjectTypeProperty, StringTypeAnnotation, NullableTypeAnnotation, TSTypeParameter, ObjectTypeAnnotation, TSTypeParameterDeclaration, TSPropertySignature, NumberTypeAnnotation, AnyTypeAnnotation, GenericTypeAnnotation } from '@babel/types';
import recast from 'recast';

const FLOW_DIRECTIVE = '@flow';

export default function({ types: t }: Babel): BabelPluginResult {
	type Converter<T extends BabelNode, O extends BabelNode> = (node: T) => O;

	interface ConverterMap {
		[type: string]: Converter<any, any>;
	}

	const converters: ConverterMap = {};

	function addConverter<T extends BabelNode, O extends BabelNode>(parent: Converter<T, O>, type: T['type'], worker: Converter<T, O>) {
		converters[type] = worker;
	}

	function convert(node: null): null;
	function convert(node: TypeParameterDeclaration | null): TSTypeParameterDeclaration;
	function convert(node: TypeParameter | null): TSTypeParameter;
	function convert(node: ObjectTypeProperty | null): TSPropertySignature;
	function convert(node: FlowType | null): TSType;
	function convert(node: BabelNode | null): BabelNode | null {
		if (!node) {
			return null;
		}
		else {
			const type = node.type;
			const converter: Converter<BabelNode, BabelNode> = converters[type];

			if (!converter) {
				throw new Error('No converter exists for node type: ' + type)
			}
			else {
				return converter(node);
			}
		}
	}

	addConverter<TypeParameterDeclaration, TSTypeParameterDeclaration>(
		convert,
		'TypeParameterDeclaration',
		(node) => t.tsTypeParameterDeclaration(
			node.params.map((param) => convert(param))
		)
	);

	addConverter<TypeParameter, TSTypeParameter>(
		convert,
		'TypeParameter',
		(node) => {
			const result = t.tsTypeParameter();
			result.name = node.name;
			return result;
		}
	);

	addConverter<ObjectTypeProperty, TSPropertySignature>(
		convert,
		'ObjectTypeProperty',
		(node) => {
			const result = t.tsPropertySignature(
				node.key,
				t.tsTypeAnnotation(convert(node.value))
			);

			if (node.variance && node.variance.kind === 'plus') {
				result.readonly = true;
			}

			return result;
		}
	);

	addConverter<StringTypeAnnotation, TSType>(
		convert,
		'StringTypeAnnotation',
		(node) => t.tsStringKeyword()
	);

	addConverter<NumberTypeAnnotation, TSType>(
		convert,
		'NumberTypeAnnotation',
		(node) => t.tsNumberKeyword()
	);

	addConverter<BooleanTypeAnnotation, TSType>(
		convert,
		'BooleanTypeAnnotation',
		(node) => t.tsBooleanKeyword()
	);

	addConverter<GenericTypeAnnotation, TSType>(
		convert,
		'GenericTypeAnnotation',
		(node) => t.tsObjectKeyword()
	);

	addConverter<AnyTypeAnnotation, TSType>(
		convert,
		'AnyTypeAnnotation',
		(node) => t.tsAnyKeyword()
	);

	addConverter<NullableTypeAnnotation, TSType>(
		convert,
		'NullableTypeAnnotation',
		(node) => t.tsUnionType([
			convert(node.typeAnnotation) as TSType,
			t.tsNullKeyword(),
			t.tsUndefinedKeyword()
		])
	);

	addConverter<ObjectTypeAnnotation, TSType>(
		convert,
		'ObjectTypeAnnotation',
		(node) => {
			const elements: TSTypeElement[] = [];

			node.properties.forEach((property) => {
				if (property.type === 'ObjectTypeProperty') {
					elements.push(convert(property));
				}
			});

			if (!node.exact) {
				const identifier = t.identifier('field');
				identifier.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());

				elements.push(
					t.tsIndexSignature(
						[identifier],
						t.tsTypeAnnotation(t.tsAnyKeyword())
					)
				);
			}

			return t.tsTypeLiteral(elements);
		}
	);

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
			}
		}
	};
}