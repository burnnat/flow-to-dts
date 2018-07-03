import { BabelTypes } from '@babel/core';
import { AnyTypeAnnotation, BooleanTypeAnnotation, FlowType, GenericTypeAnnotation, Node as BabelNode, NullableTypeAnnotation, NullLiteralTypeAnnotation, NumberTypeAnnotation, ObjectTypeAnnotation, ObjectTypeProperty, StringTypeAnnotation, TSPropertySignature, TSType, TSTypeElement, TSTypeParameter, TSTypeParameterDeclaration, TypeParameter, TypeParameterDeclaration, UnionTypeAnnotation, FunctionTypeAnnotation, VoidTypeAnnotation, FunctionTypeParam, Identifier, StringLiteralTypeAnnotation, BooleanLiteralTypeAnnotation, NumberLiteralTypeAnnotation, ThisTypeAnnotation, Expression, DeclareTypeAlias, TSTypeAliasDeclaration, Statement, DeclareModuleExports, DeclareExportDeclaration, TSTypeAnnotation, DeclareClass, ClassDeclaration, DeclareFunction, TSDeclareFunction, ClassBody, ClassMethod, ClassProperty, ClassPrivateProperty, TSDeclareMethod, TSIndexSignature, ObjectTypeSpreadProperty, ObjectTypeIndexer, LVal } from '@babel/types';
import { ConverterMap, Convert, convertInternal, addConverter } from './convert';

import createNodeConverter from './type';

export default function createConverter(t: BabelTypes) {

	const convertNode = createNodeConverter(t);

	const singleConverters: ConverterMap = {};

	function convertSingle(node: null): null;
	function convertSingle(node: ObjectTypeIndexer): TSIndexSignature;
	function convertSingle(node: ObjectTypeProperty): ClassProperty | TSDeclareMethod;
	function convertSingle(node: ObjectTypeAnnotation): ClassBody;
	function convertSingle(node: DeclareClass): ClassDeclaration;
	function convertSingle(node: DeclareFunction): TSDeclareFunction;
	function convertSingle(node: BabelNode | null): BabelNode | null {
		return convertInternal(node, singleConverters);
	}

	addConverter<ObjectTypeIndexer, TSIndexSignature>(
		convertSingle,
		singleConverters,
		'ObjectTypeIndexer',
		(node) => {
			const id = t.identifier(node.id ? node.id.name : 'index');
			id.typeAnnotation = t.tsTypeAnnotation(convertNode(node.key));

			return t.tsIndexSignature([id], t.tsTypeAnnotation(convertNode(node.value)));
		}
	);

	addConverter<ObjectTypeProperty, ClassProperty | TSDeclareMethod>(
		convertSingle,
		singleConverters,
		'ObjectTypeProperty',
		(node) => {
			const { key, value } = node;

			if ((node as any).method && t.isFunctionTypeAnnotation(value)) {
				return t.tsDeclareMethod(
					null,
					key,
					null,
					value.params.map((param) => convertNode(param)),
					t.tsTypeAnnotation(convertNode(value.returnType))
				);
			}
			else {
				return t.classProperty(
					key,
					null,
					t.tsTypeAnnotation(convertNode(value))
				);
			}
		}
	);

	addConverter<ObjectTypeAnnotation, ClassBody>(
		convertSingle,
		singleConverters,
		'ObjectTypeAnnotation',
		(node) => {
			const body: Array<ClassProperty | TSDeclareMethod | TSIndexSignature> = [];

			node.properties.forEach((property) => {
				if (t.isObjectTypeProperty(property)) {
					body.push(convertSingle(property));
				}
			});

			if (node.indexers) {
				node.indexers.forEach((indexer) => {
					body.push(convertSingle(indexer));
				});
			}

			return t.classBody(body);
		}
	);

	addConverter<DeclareClass, ClassDeclaration>(
		convertSingle,
		singleConverters,
		'DeclareClass',
		(node) => t.classDeclaration(
				node.id,
				null,
				convertSingle(node.body),
				null
			)
	);

	addConverter<DeclareFunction, TSDeclareFunction>(
		convertSingle,
		singleConverters,
		'DeclareFunction',
		(node) => {
			const id = node.id;
			const type = id.typeAnnotation;

			let params: Identifier[] = [];
			let returnType: TSTypeAnnotation | null = null;

			if (type && t.isTypeAnnotation(type)) {
				const fn = type.typeAnnotation;

				if (t.isFunctionTypeAnnotation(fn)) {
					params = fn.params.map((param) => {
						let name = 'arg';

						if (param && param.name) {
							name = param.name.name;
						}

						const result = t.identifier(name);
						result.typeAnnotation = t.tsTypeAnnotation(convertNode(param.typeAnnotation));

						return result;
					});

					returnType = t.tsTypeAnnotation(convertNode(fn.returnType));
				}
			}

			return t.tsDeclareFunction(
				// Original identifier contains type information that we don't want,
				// so we need to create a new identifier, preserving only the name.
				t.identifier(node.id.name),
				null,
				params,
				returnType
			);
		}
	);

	const wrapForExport = (node: FlowType, isDefault: boolean): Statement[] => {
		const result = convertNode(node);
		const createExport: (id: Identifier) => Statement = (
			isDefault
				? t.exportDefaultDeclaration
				: t.tsExportAssignment
		);

		if (t.isTSTypeReference(result) && result.typeParameters == null && t.isIdentifier(result.typeName)) {
			return [createExport(result.typeName)];
		}
		else {
			const identifier = t.identifier('_export');

			return [
				t.tsTypeAliasDeclaration(identifier, null, result),
				createExport(identifier)
			];
		}
	};

	const converters: ConverterMap = {};

	function convert(node: null): null;
	function convert(node: Statement): Statement[];
	function convert(node: BabelNode | null): BabelNode[] | null {
		return convertInternal(node, converters);
	}

	addConverter<DeclareModuleExports, Statement[]>(
		convert,
		converters,
		'DeclareModuleExports',
		(node) => wrapForExport(node.typeAnnotation.typeAnnotation, false)
	);

	addConverter<DeclareTypeAlias, Statement[]>(
		convert,
		converters,
		'DeclareTypeAlias',
		(node) => [
			t.tsTypeAliasDeclaration(node.id, null, convertNode(node.right))
		]
	);

	addConverter<DeclareClass, Statement[]>(
		convert,
		converters,
		'DeclareClass',
		(node) => [convertSingle(node)]
	);

	addConverter<DeclareFunction, Statement[]>(
		convert,
		converters,
		'DeclareFunction',
		(node) => [convertSingle(node)]
	);

	addConverter<DeclareExportDeclaration, Statement[]>(
		convert,
		converters,
		'DeclareExportDeclaration',
		(node) => {
			const declaration = node.declaration;

			if (declaration === null) {
				return [];
			}
			else if (t.isFlowType(declaration)) {
				return wrapForExport(declaration as FlowType, (node as any).default);
			}
			else if (t.isTypeAlias(declaration)) {
				return [
					t.exportNamedDeclaration(
						t.tsTypeAliasDeclaration(
							declaration.id,
							convertNode(declaration.typeParameters),
							convertNode(declaration.right)
						),
						[]
					)
				];
			}
			else if (t.isDeclareClass(declaration)) {
				return [
					t.exportNamedDeclaration(
						convertSingle(declaration),
						[]
					)
				];
			}
			else if (t.isDeclareFunction(declaration)) {
				return [
					t.exportNamedDeclaration(
						convertSingle(declaration),
						[]
					)
				];
			}
			else {
				return [node];
			}
		}
	);

	function convertBody(nodes: Statement[]): Statement[] {
		return nodes.reduce(
			(acc: Statement[], node) => acc.concat(convert(node)),
			[]
		);
	}

	return convertBody;
}