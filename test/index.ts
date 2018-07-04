import * as t from '@babel/types';
import { assert } from 'chai';

import * as flowToDts from '../src/index';

describe('node api', () => {
	const makeAst = () => t.program([
		t.typeAlias(
			t.identifier('Custom'),
			null,
			t.stringTypeAnnotation()
		)
	]);

	it('transforms code', () =>
		flowToDts
			.transform('type Custom = string;')
			.then((output) => {
				assert.isNotNull(output);
			})
	);

	it('errors on invalid code', () =>
		flowToDts
			.transform('type Custom =')
			.then(() => {
				assert.fail();
			})
			.catch((err) => {
				assert.isNotNull(err);
			})
	);

	it('transforms ast', () => 
		flowToDts
			.transformAst(makeAst())
			.then((output) => {
				assert.isNotNull(output);
			})
	);

	it('errors on unknown type', () => {
		const ast = makeAst();
		(ast.body[0] as t.TypeAlias).right = { type: 'UnknownType' } as any;

		return (
			flowToDts
				.transformAst(ast)
				.then(() => {
					assert.fail();
				})
				.catch((err) => {
					assert.isNotNull(err);
				})
		);
	})
});