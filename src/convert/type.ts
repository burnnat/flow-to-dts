import { BabelTypes } from '@babel/core';
import { AnyTypeAnnotation, BooleanTypeAnnotation, FlowType, GenericTypeAnnotation, Node as BabelNode, NullableTypeAnnotation, NullLiteralTypeAnnotation, NumberTypeAnnotation, ObjectTypeAnnotation, ObjectTypeProperty, StringTypeAnnotation, TSPropertySignature, TSType, TSTypeElement, TSTypeParameter, TSTypeParameterDeclaration, TypeParameter, TypeParameterDeclaration, UnionTypeAnnotation, FunctionTypeAnnotation, VoidTypeAnnotation, FunctionTypeParam, Identifier, StringLiteralTypeAnnotation, BooleanLiteralTypeAnnotation, NumberLiteralTypeAnnotation, ThisTypeAnnotation, MixedTypeAnnotation, TypeofTypeAnnotation, TSTypeQuery, TypeParameterInstantiation, ArrayTypeAnnotation, ExistsTypeAnnotation, IntersectionTypeAnnotation, QualifiedTypeIdentifier, TSQualifiedName, TSTypeParameterInstantiation, TSEntityName, TupleTypeAnnotation } from '@babel/types';
import { ConverterMap, Convert, convertInternal, addConverter } from './convert';
import { ConvertBuiltin } from './builtin';

export type ConvertType = ReturnType<typeof createConverter>;

export default function createConverter(t: BabelTypes, convertBuiltin: ConvertBuiltin) {
	const converters: ConverterMap = {};

	function convert(node: null): null;
	function convert(node: TypeParameterDeclaration | null): TSTypeParameterDeclaration;
	function convert(node: TypeParameterInstantiation | null): TSTypeParameterInstantiation;
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

	addConverter<TypeParameterInstantiation, TSTypeParameterInstantiation>(
		convert,
		converters,
		'TypeParameterInstantiation',
		(node) => t.tsTypeParameterInstantiation(
			node.params.map((param) => convert(param))
		)
	);

	addConverter<TypeParameter, TSTypeParameter>(
		convert,
		converters,
		'TypeParameter',
		(node) => {
			const result = t.tsTypeParameter(
				convert(node.bound && node.bound.typeAnnotation),
				convert((node as any).default)
			);
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

			result.optional = node.optional;

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

	const parenthesizeTypes = (types: FlowType[]) => types.map(
		(subtype) => {
			const result = convert(subtype);

			if (t.isFunctionTypeAnnotation(subtype)) {
				return t.tsParenthesizedType(result);
			}
			else {
				return result;
			}
		}
	);

	addConverter<UnionTypeAnnotation, TSType>(
		convert,
		converters,
		'UnionTypeAnnotation',
		(node) => t.tsUnionType(parenthesizeTypes(node.types))
	);

	addConverter<IntersectionTypeAnnotation, TSType>(
		convert,
		converters,
		'IntersectionTypeAnnotation',
		(node) => t.tsIntersectionType(parenthesizeTypes(node.types))
	);

	addConverter<TupleTypeAnnotation, TSType>(
		convert,
		converters,
		'TupleTypeAnnotation',
		(node) => t.tsTupleType(node.types.map(convert))
	);

	addConverter<ArrayTypeAnnotation, TSType>(
		convert,
		converters,
		'ArrayTypeAnnotation',
		(node) => t.tsArrayType(convert(node.elementType))
	);

	const convertQualifiedName = (value: QualifiedTypeIdentifier | Identifier): TSEntityName => {
		if (t.isQualifiedTypeIdentifier(value)) {
			return t.tsQualifiedName(convertQualifiedName(value.qualification), value.id);
		}
		else {
			return value;
		}
	}

	const createTypeOf = (param: FlowType) => {
		if (t.isGenericTypeAnnotation(param)) {
			return t.tsTypeQuery(convertQualifiedName(param.id));
		}
		else {
			throw new Error('Complex expressions for typeof not yet supported: ' + param.type);
		}
	}

	const convertSpecialType = (id: Identifier | QualifiedTypeIdentifier, params: FlowType[]) => {
		if (id.type !== 'Identifier') {
			return null;
		}

		switch (id.name) {
			case 'Class':
				return createTypeOf(params[0]);
			case '$Shape':
				return t.tsTypeReference(
					t.identifier('Partial'),
					t.tsTypeParameterInstantiation(
						params.map((param) => convert(param))
					)
				);
			default:
				return null;
		}
	};

	addConverter<GenericTypeAnnotation, TSType>(
		convert,
		converters,
		'GenericTypeAnnotation',
		(node) => {
			const sourceParams = node.typeParameters;
			let result;

			// First check if this is a special Flow utility type
			result = convertSpecialType(node.id, sourceParams ? sourceParams.params : []);

			if (result) {
				return result;
			}

			const typeParams = sourceParams != null
				? t.tsTypeParameterInstantiation(
					sourceParams.params.map((param) => convert(param))
				)
				: null;

			// Otherwise it could be a built-in type from Node.js or similar
			result = convertBuiltin(node, typeParams);

			if (result) {
				return result;
			}

			// If not, simply output the type as-is
			result = t.tsTypeReference(convertQualifiedName(node.id));
			result.typeParameters = typeParams;

			return result;
		}
	);

	addConverter<TypeofTypeAnnotation, TSType>(
		convert,
		converters,
		'TypeofTypeAnnotation',
		(node) => createTypeOf(node.argument)
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

	addConverter<ExistsTypeAnnotation, TSType>(
		convert,
		converters,
		'ExistsTypeAnnotation',
		(node) => t.tsAnyKeyword()
	);

	return convert;
}