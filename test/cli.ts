import fs from 'fs';
import os from 'os';
import path from 'path';
import { assert } from 'chai';
import run from 'test-cli';
import fsify = require('fsify');

import cli from '../src/cli';

const files = fsify({
	cwd: os.tmpdir(),
	persistent: false,
	force: true
});

const flowToDts = run.bind(null, cli);

describe('command line', () => {
	it('shows help', (done) => {
		flowToDts('--help', function(stdout: string, stderr: string, code: number) {
			try {
				assert.isNotEmpty(stdout.trim());
				assert.strictEqual(0, code);
				done();
			}
			catch (err) {
				done(err);
			}
		});
	});

	it('rejects missing input file', (done) => {
		flowToDts('missing.js', 'missing.d.ts', (stdout: string, stderr: string, code: number) => {
			try {
				assert.isNotEmpty(stdout.trim());
				assert.notStrictEqual(0, code);
				done();
			}
			catch (err) {
				done(err);
			}
		});
	})

	it('transforms file into new file', (done) => {
		files([
			{
				type: fsify.DIRECTORY,
				name: 'temp',
				contents: [
					{
						type: fsify.FILE,
						name: 'input.js',
						contents: 'type Sample = string;'
					}
				]
			}
		]).then((structure: any) => {
			const input = structure[0].contents[0].name;
			const output = path.join(structure[0].name, 'output.d.ts');

			flowToDts(input, output, (stdout: string, stderr: string, code: number) => {
				try {
					assert.isTrue(fs.existsSync(output));
					assert.isNotEmpty(stdout.trim());
					assert.strictEqual(code, 0);
					done();
				}
				catch (err) {
					done(err);
				}
			});
		});
	});
});
