import { Babel, BabelPluginResult } from '@babel/core';
import { Node as BabelNode } from '@babel/types';
import { TypeParameterDeclaration, TypeParameter, TypeAlias, FlowType, TSType, TSTypeElement, ObjectTypeProperty, StringTypeAnnotation, NullableTypeAnnotation, TSTypeParameter, ObjectTypeAnnotation, TSTypeParameterDeclaration, TSPropertySignature, NumberTypeAnnotation, AnyTypeAnnotation, GenericTypeAnnotation } from '@babel/types';
import flowSyntax from '@babel/plugin-syntax-flow';

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
		(node) => t.tsPropertySignature(
			node.key,
			t.tsTypeAnnotation(convert(node.value))
		)
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