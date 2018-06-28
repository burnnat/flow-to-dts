import run from 'test-cli';
import cli from '../src/cli';

interface Process {
	stdout?: any;
	exit?: any;
}

let origProcess: Process = {};

const assignProcess = (src: Process, dest: Process) => {
	dest.stdout = src.stdout;
	dest.exit = src.exit;
}

const flowToDts = run.bind(null, cli, (mockProcess: Process) => {
	assignProcess(process, origProcess);
	assignProcess(mockProcess, process);
});

const cleanup = () => {
	assignProcess(origProcess, process);
};

describe('command line', () => {
	it('shows help', () => {
		try {
			flowToDts('--help', () => {});
		}
		catch (e) {
			// Expected for help.
		}
	});
});
