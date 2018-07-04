import { BabelTypes } from "@babel/core";
import { Node as BabelNode, ObjectTypeAnnotation, Expression, TSType, TSTypeAnnotation, Identifier, DeclareClass, ClassDeclaration, DeclareInterface, TSInterfaceDeclaration, TSIndexSignature, InterfaceDeclaration } from "@babel/types";

import createTypeConverter from './type';
import { ConverterMap, convertInternal, addConverter } from "./convert";

type ConvertMethod<T> = (key: Expression, params: Identifier[], returnType: TSTypeAnnotation, isConstructor: boolean) => T;
type ConvertProperty<T> = (key: Expression, type: TSTypeAnnotation, optional: boolean) => T;
type PropertyList<M, P> = (M | P | TSIndexSignature)[];

export default function createPropertyConverters(t: BabelTypes) {
	const convertType = createTypeConverter(t);
	const converters: ConverterMap = {};

	function convert(node: null): null;
	function convert(node: DeclareClass | null): ClassDeclaration;
	function convert(node: DeclareInterface | null): TSInterfaceDeclaration;
	function convert(node: InterfaceDeclaration | null): TSInterfaceDeclaration;
	function convert(node: BabelNode | null): BabelNode | null {
		return convertInternal(node, converters);
	}

	const mapProperties = <M, P>(
		body: ObjectTypeAnnotation,
		convertMethod: ConvertMethod<M>,
		convertProperty: ConvertProperty<P>
	): PropertyList<M, P> => {
		const members: PropertyList<M, P> = [];
	
		body.properties.forEach((property) => {
			if (t.isObjectTypeProperty(property)) {
				const key = property.key;
				const value = property.value;
	
				if ((property as any).method && t.isFunctionTypeAnnotation(value)) {
					members.push(
						convertMethod(
							key,
							value.params.map((param) => convertType(param)),
							t.tsTypeAnnotation(convertType(value.returnType)),
							t.isIdentifier(key) && key.name === 'constructor'
						)
					);
				}
				else {
					members.push(
						convertProperty(
							key,
							t.tsTypeAnnotation(convertType(value)),
							property.optional || false
						)
					);
				}
			}
		});

		if (body.indexers) {
			body.indexers.forEach((indexer) => {
				const id = t.identifier(indexer.id ? indexer.id.name : 'index');
				id.typeAnnotation = t.tsTypeAnnotation(convertType(indexer.key));
	
				members.push(
					t.tsIndexSignature(
						[id],
						t.tsTypeAnnotation(convertType(indexer.value))
					)
				);
			});
		}
	
		return members;
	}

	const convertClassBody = (body: ObjectTypeAnnotation) => t.classBody(
		mapProperties(
			body,
			(key: Expression, params: Identifier[], returnType: TSTypeAnnotation | null, isConstructor: boolean) => {
				const result = t.tsDeclareMethod(null, key, null, params, isConstructor ? null : returnType);
				result.kind = isConstructor ? 'constructor' : 'method';
				return result;
			},
			(key: Expression, type: TSTypeAnnotation, optional: boolean) => {
				const result = t.classProperty(key, null, type);
				result.optional = optional;
				return result;
			}
		)
	);

	const convertInterfaceBody = (body: ObjectTypeAnnotation) => t.tsInterfaceBody(
		mapProperties(
			body,
			(key: Expression, params: Identifier[], returnType: TSTypeAnnotation) =>
				t.tsMethodSignature(key, null, params, returnType),
			(key: Expression, type: TSTypeAnnotation, optional: boolean) => {
				const result = t.tsPropertySignature(key, type);
				result.optional = optional;
				return result;
			}
		)
	);

	addConverter<DeclareClass, ClassDeclaration>(
		convert,
		converters,
		'DeclareClass',
		(node) => t.classDeclaration(
			node.id,
			null,
			convertClassBody(node.body)
		)
	);

	addConverter<DeclareInterface, TSInterfaceDeclaration>(
		convert,
		converters,
		'DeclareInterface',
		(node) => t.tsInterfaceDeclaration(
			node.id,
			null,
			null,
			convertInterfaceBody(node.body)
		)
	);

	addConverter<InterfaceDeclaration, TSInterfaceDeclaration>(
		convert,
		converters,
		'InterfaceDeclaration',
		(node) => t.tsInterfaceDeclaration(
			node.id,
			null,
			null,
			convertInterfaceBody(node.body)
		)
	);

	return convert;
}