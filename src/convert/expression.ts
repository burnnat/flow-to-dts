import { BabelTypes } from '@babel/core';
import { AnyTypeAnnotation, BooleanTypeAnnotation, FlowType, GenericTypeAnnotation, Node as BabelNode, NullableTypeAnnotation, NullLiteralTypeAnnotation, NumberTypeAnnotation, ObjectTypeAnnotation, ObjectTypeProperty, StringTypeAnnotation, TSPropertySignature, TSType, TSTypeElement, TSTypeParameter, TSTypeParameterDeclaration, TypeParameter, TypeParameterDeclaration, UnionTypeAnnotation, FunctionTypeAnnotation, VoidTypeAnnotation, FunctionTypeParam, Identifier, StringLiteralTypeAnnotation, BooleanLiteralTypeAnnotation, NumberLiteralTypeAnnotation, ThisTypeAnnotation, Expression } from '@babel/types';
import { ConverterMap, Convert, convertInternal, addConverter } from './convert';

export default function createConverter(t: BabelTypes) {
	const converters: ConverterMap = {};

	function convert(node: null): null;
	function convert(node: FlowType): Expression;
	function convert(node: BabelNode | null): BabelNode | null {
		return convertInternal(node, converters);
	}

	addConverter<GenericTypeAnnotation, Expression>(
		convert,
		converters,
		'GenericTypeAnnotation',
		(node) => {
			if (node.id.name === 'Class' && node.typeParameters != null) {
				const param = node.typeParameters.params[0];

				if (t.isGenericTypeAnnotation(param)) {
					return t.unaryExpression('typeof', param.id);
				}
				else {
					throw new Error('Complex expressions for typeof not yet supported: ' + param.type);
				}
			}
			else {
				return node.id;
			}
		}
	);

	return convert;
}