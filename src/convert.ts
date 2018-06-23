import { BabelTypes } from '@babel/core';
import { AnyTypeAnnotation, BooleanTypeAnnotation, FlowType, GenericTypeAnnotation, Node as BabelNode, NullableTypeAnnotation, NullLiteralTypeAnnotation, NumberTypeAnnotation, ObjectTypeAnnotation, ObjectTypeProperty, StringTypeAnnotation, TSPropertySignature, TSType, TSTypeElement, TSTypeParameter, TSTypeParameterDeclaration, TypeParameter, TypeParameterDeclaration, UnionTypeAnnotation, FunctionTypeAnnotation, VoidTypeAnnotation, FunctionTypeParam, Identifier } from '@babel/types';

type Convert<T extends BabelNode, O extends BabelNode> = (node: T) => O;

interface ConverterMap {
	[type: string]: Convert<any, any>;
}

export default function createConverter(t: BabelTypes) {
	const converters: ConverterMap = {};

	function convert(node: null): null;
	function convert(node: TypeParameterDeclaration | null): TSTypeParameterDeclaration;
	function convert(node: TypeParameter | null): TSTypeParameter;
	function convert(node: ObjectTypeProperty | null): TSPropertySignature;
	function convert(node: FunctionTypeParam | null): Identifier;
	function convert(node: FlowType | null): TSType;
	function convert(node: BabelNode | null): BabelNode | null {
		if (!node) {
			return null;
		}
		else {
			const type = node.type;
			const converter: Convert<BabelNode, BabelNode> = converters[type];

			if (!converter) {
				const loc = node.loc;
				const prefix = loc ? `[${loc.start.line}:${loc.start.column}] ` : '';
				throw new Error(prefix + 'No converter exists for node type: ' + type)
			}
			else {
				return converter(node);
			}
		}
	}

	function addConverter<T extends BabelNode, O extends BabelNode>(parent: Convert<T, O>, type: T['type'], worker: Convert<T, O>) {
		converters[type] = worker;
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

	addConverter<FunctionTypeAnnotation, TSType>(
		convert,
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
		'NullableTypeAnnotation',
		(node) => t.tsUnionType([
			convert(node.typeAnnotation) as TSType,
			t.tsNullKeyword(),
			t.tsUndefinedKeyword()
		])
	);

	addConverter<UnionTypeAnnotation, TSType>(
		convert,
		'UnionTypeAnnotation',
		(node) => t.tsUnionType(node.types.map(convert))
	);

	addConverter<GenericTypeAnnotation, TSType>(
		convert,
		'GenericTypeAnnotation',
		(node) => t.tsTypeReference(node.id)
	);

	addConverter<VoidTypeAnnotation, TSType>(
		convert,
		'VoidTypeAnnotation',
		(node) => t.tsVoidKeyword()
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

	addConverter<AnyTypeAnnotation, TSType>(
		convert,
		'AnyTypeAnnotation',
		(node) => t.tsAnyKeyword()
	);

	addConverter<NullLiteralTypeAnnotation, TSType>(
		convert,
		'NullLiteralTypeAnnotation',
		(node) => t.tsNullKeyword()
	);

	return convert;
}
