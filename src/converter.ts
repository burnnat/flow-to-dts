import { Babel, BabelTypes, BabelPluginResult } from '@babel/core';
import { Node as BabelNode, BooleanTypeAnnotation } from '@babel/types';
import { TypeParameterDeclaration, TypeParameter, TypeAlias, FlowType, TSType, TSTypeElement, ObjectTypeProperty, StringTypeAnnotation, NullableTypeAnnotation, TSTypeParameter, ObjectTypeAnnotation, TSTypeParameterDeclaration, TSPropertySignature, NumberTypeAnnotation, AnyTypeAnnotation, GenericTypeAnnotation, NullLiteralTypeAnnotation } from '@babel/types';

type Convert<T extends BabelNode, O extends BabelNode> = (node: T) => O;

interface ConverterMap {
	[type: string]: Convert<any, any>;
}

export default class Converter {

	private converters: ConverterMap;
	private t: BabelTypes;

	constructor(t: BabelTypes) {
		this.converters = {};
		this.t = t;

		this.initConverters();
	}

	convert(node: null): null;
	convert(node: TypeParameterDeclaration | null): TSTypeParameterDeclaration;
	convert(node: TypeParameter | null): TSTypeParameter;
	convert(node: ObjectTypeProperty | null): TSPropertySignature;
	convert(node: FlowType | null): TSType;
	convert(node: BabelNode | null): BabelNode | null {
		if (!node) {
			return null;
		}
		else {
			const type = node.type;
			const converter: Convert<BabelNode, BabelNode> = this.converters[type];

			if (!converter) {
				throw new Error('No converter exists for node type: ' + type)
			}
			else {
				return converter(node);
			}
		}
	}

	private addConverter<T extends BabelNode, O extends BabelNode>(parent: Convert<T, O>, type: T['type'], worker: Convert<T, O>) {
		this.converters[type] = worker;
	}

	private initConverters() {
		const t = this.t;
		const convert = this.convert.bind(this);

		this.addConverter<TypeParameterDeclaration, TSTypeParameterDeclaration>(
			convert,
			'TypeParameterDeclaration',
			(node) => t.tsTypeParameterDeclaration(
				node.params.map((param) => convert(param))
			)
		);

		this.addConverter<TypeParameter, TSTypeParameter>(
			convert,
			'TypeParameter',
			(node) => {
				const result = t.tsTypeParameter();
				result.name = node.name;
				return result;
			}
		);

		this.addConverter<ObjectTypeAnnotation, TSType>(
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

		this.addConverter<ObjectTypeProperty, TSPropertySignature>(
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

		this.addConverter<NullableTypeAnnotation, TSType>(
			convert,
			'NullableTypeAnnotation',
			(node) => t.tsUnionType([
				convert(node.typeAnnotation) as TSType,
				t.tsNullKeyword(),
				t.tsUndefinedKeyword()
			])
		);

		this.addConverter<StringTypeAnnotation, TSType>(
			convert,
			'StringTypeAnnotation',
			(node) => t.tsStringKeyword()
		);

		this.addConverter<NumberTypeAnnotation, TSType>(
			convert,
			'NumberTypeAnnotation',
			(node) => t.tsNumberKeyword()
		);

		this.addConverter<BooleanTypeAnnotation, TSType>(
			convert,
			'BooleanTypeAnnotation',
			(node) => t.tsBooleanKeyword()
		);

		this.addConverter<GenericTypeAnnotation, TSType>(
			convert,
			'GenericTypeAnnotation',
			(node) => t.tsObjectKeyword()
		);

		this.addConverter<AnyTypeAnnotation, TSType>(
			convert,
			'AnyTypeAnnotation',
			(node) => t.tsAnyKeyword()
		);

		this.addConverter<NullLiteralTypeAnnotation, TSType>(
			convert,
			'NullLiteralTypeAnnotation',
			(node) => t.tsNullKeyword()
		);
	}
}