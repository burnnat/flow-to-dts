import { assert } from 'chai';

import flowToDts from '../src/index';

describe('node api', () => {
	it('transforms code', () => {
		flowToDts('type Custom = string;').then((output) => {
			assert.isNotNull(output);
		});
	});
});