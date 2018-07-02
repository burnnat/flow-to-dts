import { BabelTypes } from '@babel/core';
import { AnyTypeAnnotation, BooleanTypeAnnotation, FlowType, GenericTypeAnnotation, Node as BabelNode, NullableTypeAnnotation, NullLiteralTypeAnnotation, NumberTypeAnnotation, ObjectTypeAnnotation, ObjectTypeProperty, StringTypeAnnotation, TSPropertySignature, TSType, TSTypeElement, TSTypeParameter, TSTypeParameterDeclaration, TypeParameter, TypeParameterDeclaration, UnionTypeAnnotation, FunctionTypeAnnotation, VoidTypeAnnotation, FunctionTypeParam, Identifier, StringLiteralTypeAnnotation, BooleanLiteralTypeAnnotation, NumberLiteralTypeAnnotation, ThisTypeAnnotation, MixedTypeAnnotation } from '@babel/types';
import { ConverterMap, Convert, convertInternal, addConverter } from './convert';

export default function createConverter(t: BabelTypes) {
	const converters: ConverterMap = {};

	function convert(node: null): null;
	function convert(node: TypeParameterDeclaration | null): TSTypeParameterDeclaration;
	function convert(node: TypeParameter | null): TSTypeParameter;
	function convert(node: ObjectTypeProperty | null): TSPropertySignature;
	function convert(node: FunctionTypeParam | null): Identifier;
	function convert(node: FlowType | null): TSType;
	function convert(node: BabelNode | null): BabelNode | null {
		return convertInternal(node, converters);
	}

	addConverter<TypeParameterDeclaration, TSTypeParameterDeclaration>(
		convert,
		converters,
		'TypeParameterDeclaration',
		(node) => t.tsTypeParameterDeclaration(
			node.params.map((param) => convert(param))
		)
	);

	addConverter<TypeParameter, TSTypeParameter>(
		convert,
		converters,
		'TypeParameter',
		(node) => {
			const result = t.tsTypeParameter();
			result.name = node.name;
			return result;
		}
	);

	addConverter<ObjectTypeAnnotation, TSType>(
		convert,
		converters,
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

	addConverter<ObjectTypeProperty, TSPropertySignature>(
		convert,
		converters,
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

	addConverter<FunctionTypeAnnotation, TSType>(
		convert,
		converters,
		'FunctionTypeAnnotation',
		(node) => {
			const result = t.tsFunctionType();

			result.parameters = node.params.map((param) => convert(param));
			result.typeAnnotation = t.tsTypeAnnotation(convert(node.returnType));

			return result;
		}
	);

	addConverter<FunctionTypeParam, Identifier>(
		convert,
		converters,
		'FunctionTypeParam',
		(node) => {
			const result = t.identifier(
				node.name
					? node.name.name
					: 'arg'
			);
			
			result.optional = node.optional;
			result.typeAnnotation = t.tsTypeAnnotation(
				convert(node.typeAnnotation)
			);

			return result;
		}
	);

	addConverter<NullableTypeAnnotation, TSType>(
		convert,
		converters,
		'NullableTypeAnnotation',
		(node) => t.tsUnionType([
			convert(node.typeAnnotation) as TSType,
			t.tsNullKeyword(),
			t.tsUndefinedKeyword()
		])
	);

	addConverter<UnionTypeAnnotation, TSType>(
		convert,
		converters,
		'UnionTypeAnnotation',
		(node) => t.tsUnionType(
			node.types.map((subtype) => {
				const result = convert(subtype);

				if (subtype.type === 'FunctionTypeAnnotation') {
					return t.tsParenthesizedType(result);
				}
				else {
					return result;
				}
			})
		)
	);

	addConverter<GenericTypeAnnotation, TSType>(
		convert,
		converters,
		'GenericTypeAnnotation',
		(node) => {
			const typeParams = node.typeParameters;

			if (node.id.name === 'Class' && typeParams != null) {
				const param = typeParams.params[0];

				if (t.isGenericTypeAnnotation(param)) {
					return t.tsTypeQuery(param.id);
				}
				else {
					throw new Error('Complex expressions for typeof not yet supported: ' + param.type);
				}
			}
			else {
				const result = t.tsTypeReference(node.id);

				if (typeParams != null) {
					result.typeParameters = t.tsTypeParameterInstantiation(
						typeParams.params.map((param) => convert(param))
					);
				}

				return result;
			}
		}
	);

	addConverter<VoidTypeAnnotation, TSType>(
		convert,
		converters,
		'VoidTypeAnnotation',
		(node) => t.tsVoidKeyword()
	);

	addConverter<StringTypeAnnotation, TSType>(
		convert,
		converters,
		'StringTypeAnnotation',
		(node) => t.tsStringKeyword()
	);

	addConverter<NumberTypeAnnotation, TSType>(
		convert,
		converters,
		'NumberTypeAnnotation',
		(node) => t.tsNumberKeyword()
	);

	addConverter<BooleanTypeAnnotation, TSType>(
		convert,
		converters,
		'BooleanTypeAnnotation',
		(node) => t.tsBooleanKeyword()
	);

	addConverter<AnyTypeAnnotation, TSType>(
		convert,
		converters,
		'AnyTypeAnnotation',
		(node) => t.tsAnyKeyword()
	);

	addConverter<ThisTypeAnnotation, TSType>(
		convert,
		converters,
		'ThisTypeAnnotation',
		(node) => t.tsThisType()
	);

	addConverter<NullLiteralTypeAnnotation, TSType>(
		convert,
		converters,
		'NullLiteralTypeAnnotation',
		(node) => t.tsNullKeyword()
	);

	addConverter<BooleanLiteralTypeAnnotation, TSType>(
		convert,
		converters,
		'BooleanLiteralTypeAnnotation',
		(node) => t.tsLiteralType(t.booleanLiteral(node.value))
	);

	addConverter<NumberLiteralTypeAnnotation, TSType>(
		convert,
		converters,
		'NumberLiteralTypeAnnotation',
		(node) => t.tsLiteralType(t.numericLiteral(node.value))
	);

	addConverter<StringLiteralTypeAnnotation, TSType>(
		convert,
		converters,
		'StringLiteralTypeAnnotation',
		(node) => t.tsLiteralType(t.stringLiteral(node.value))
	);

	addConverter<MixedTypeAnnotation, TSType>(
		convert,
		converters,
		'MixedTypeAnnotation',
		(node) => t.tsUnionType([
			t.tsNumberKeyword(),
			t.tsStringKeyword(),
			t.tsBooleanKeyword(),
			t.tsSymbolKeyword(),
			t.tsObjectKeyword()
		])
	);

	return convert;
}