import flowToDts from '../dist/index';

describe('node api', () => {
	it('transforms code', () => {
		flowToDts(
			'type Custom = string;',
			(err: Error | null, output: string | null) => {
				if (err) {
					throw err;
				}
			}
		);
	});
});