import run from 'test-cli';
import cli from '../dist/cli';

const flowToDts = run.bind(null, cli);

describe('command line', () => {
	it('shows help', () => {
		flowToDts('--help', () => {});
	});
});
