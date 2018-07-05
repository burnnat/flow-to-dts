import { BabelTypes } from "@babel/core";
import { Node as BabelNode, ObjectTypeAnnotation, Expression, TSType, TSTypeAnnotation, Identifier, DeclareClass, ClassDeclaration, DeclareInterface, TSInterfaceDeclaration, TSIndexSignature, InterfaceDeclaration, InterfaceExtends, TSTypeParameterDeclaration, TypeParameterDeclaration } from "@babel/types";

import { ConvertType } from './type';
import { ConverterMap, convertInternal, addConverter } from "./convert";

type ConvertMethod<T> = (key: Expression, typeParams: TSTypeParameterDeclaration, params: Identifier[], returnType: TSTypeAnnotation, isConstructor: boolean) => T;
type ConvertProperty<T> = (key: Expression, type: TSTypeAnnotation, optional: boolean) => T;
type PropertyList<M, P> = (M | P | TSIndexSignature)[];

export type ConvertClasslike = ReturnType<typeof createConverter>;

export default function createConverter(t: BabelTypes, convertType: ConvertType) {

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
							convertType(value.typeParameters),
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
			(key: Expression, typeParams: TSTypeParameterDeclaration, params: Identifier[], returnType: TSTypeAnnotation | null, isConstructor: boolean) => {
				const result = t.tsDeclareMethod(null, key, typeParams, params, isConstructor ? null : returnType);
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
			(key: Expression, typeParams: TSTypeParameterDeclaration, params: Identifier[], returnType: TSTypeAnnotation) =>
				t.tsMethodSignature(key, typeParams, params, returnType),
			(key: Expression, type: TSTypeAnnotation, optional: boolean) => {
				const result = t.tsPropertySignature(key, type);
				result.optional = optional;
				return result;
			}
		)
	);

	// Type definitions for babel-types does not list "extends" properties on DeclareClass,
	// DeclareInterface, or InterfaceDeclaration, so we cast to any to handle it.
	const convertExtends = (node: any) => {
		const array: InterfaceExtends[] = node.extends || [];

		return array.map(
			(superclass) => t.tsExpressionWithTypeArguments(
				superclass.id,
				convertType(superclass.typeParameters)
			)
		);
	};

	addConverter<DeclareClass, ClassDeclaration>(
		convert,
		converters,
		'DeclareClass',
		(node) => {
			const superclass = convertExtends(node)[0];

			const result = t.classDeclaration(
				node.id,
				superclass && superclass.expression as Identifier,
				convertClassBody(node.body)
			);

			// The babel-types API lists DeclareClass.typeParameters as type TypeParameterInstantiation
			// but it actually parses as TypeParameterDeclaration, so we need a cast to work around it.
			result.typeParameters = convertType(node.typeParameters as any);
			result.superTypeParameters = superclass && superclass.typeParameters;
			(result as any).implements = (node as any).implements;

			return result;
		}
	);

	interface CompatibleInterface {
		id: Identifier;
		typeParameters: TypeParameterDeclaration | null;
		body: ObjectTypeAnnotation;
	}

	const convertInterface = (node: CompatibleInterface) => t.tsInterfaceDeclaration(
		node.id,
		convertType(node.typeParameters),
		convertExtends(node),
		convertInterfaceBody(node.body)
	);

	addConverter<DeclareInterface, TSInterfaceDeclaration>(
		convert,
		converters,
		'DeclareInterface',
		convertInterface
	);

	addConverter<InterfaceDeclaration, TSInterfaceDeclaration>(
		convert,
		converters,
		'InterfaceDeclaration',
		convertInterface
	);

	return convert;
}