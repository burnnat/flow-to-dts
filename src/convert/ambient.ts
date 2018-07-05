import { BabelTypes } from '@babel/core';
import { AnyTypeAnnotation, BooleanTypeAnnotation, FlowType, GenericTypeAnnotation, Node as BabelNode, NullableTypeAnnotation, NullLiteralTypeAnnotation, NumberTypeAnnotation, ObjectTypeAnnotation, ObjectTypeProperty, StringTypeAnnotation, TSPropertySignature, TSType, TSTypeElement, TSTypeParameter, TSTypeParameterDeclaration, TypeParameter, TypeParameterDeclaration, UnionTypeAnnotation, FunctionTypeAnnotation, VoidTypeAnnotation, FunctionTypeParam, Identifier, StringLiteralTypeAnnotation, BooleanLiteralTypeAnnotation, NumberLiteralTypeAnnotation, ThisTypeAnnotation, Expression, DeclareTypeAlias, TSTypeAliasDeclaration, Statement, DeclareModuleExports, DeclareExportDeclaration, TSTypeAnnotation, DeclareClass, ClassDeclaration, DeclareFunction, TSDeclareFunction, ClassBody, ClassMethod, ClassProperty, ClassPrivateProperty, TSDeclareMethod, TSIndexSignature, ObjectTypeSpreadProperty, ObjectTypeIndexer, LVal, DeclareInterface, TypeAlias } from '@babel/types';
import { ConverterMap, Convert, convertInternal, addConverter } from './convert';

import createTypeConverter from './type';
import createClasslikeConverter from './classlike';

export default function createConverter(t: BabelTypes) {

	const convertType = createTypeConverter(t);
	const convertClasslike = createClasslikeConverter(t);

	const singleConverters: ConverterMap = {};

	function convertSingle(node: null): null;
	function convertSingle(node: TypeAlias): TSTypeAliasDeclaration;
	function convertSingle(node: DeclareTypeAlias): TSTypeAliasDeclaration;
	function convertSingle(node: DeclareFunction): TSDeclareFunction;
	function convertSingle(node: BabelNode | null): BabelNode | null {
		return convertInternal(node, singleConverters);
	}

	interface CompatibleTypeAlias {
		id: Identifier;
		typeParameters: TypeParameterDeclaration | null;
		right: FlowType;
	}

	const convertTypeAlias = (node: CompatibleTypeAlias) => t.tsTypeAliasDeclaration(
		node.id,
		convertType(node.typeParameters),
		convertType(node.right)
	);

	addConverter<DeclareTypeAlias, TSTypeAliasDeclaration>(
		convertSingle,
		singleConverters,
		'DeclareTypeAlias',
		convertTypeAlias
	);

	addConverter<TypeAlias, TSTypeAliasDeclaration>(
		convertSingle,
		singleConverters,
		'TypeAlias',
		convertTypeAlias
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
						result.typeAnnotation = t.tsTypeAnnotation(convertType(param.typeAnnotation));

						return result;
					});

					returnType = t.tsTypeAnnotation(convertType(fn.returnType));
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
		const result = convertType(node);
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
		(node) => [convertSingle(node)]
	);

	addConverter<DeclareClass, Statement[]>(
		convert,
		converters,
		'DeclareClass',
		(node) => [convertClasslike(node)]
	);

	addConverter<DeclareInterface, Statement[]>(
		convert,
		converters,
		'DeclareInterface',
		(node) => [convertClasslike(node)]
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
						convertSingle(declaration),
						[]
					)
				];
			}
			else if (t.isDeclareClass(declaration)) {
				return [
					t.exportNamedDeclaration(
						convertClasslike(declaration),
						[]
					)
				];
			}
			// TODO: why does babel parse this as InterfaceDeclaration rather than DeclareInterface?
			else if (t.isInterfaceDeclaration(declaration)) {
				return [
					t.exportNamedDeclaration(
						convertClasslike(declaration),
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