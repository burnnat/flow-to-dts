import fs from 'fs';
import program from 'yargs';

import project from '../package.json';
import transform from './index';

type Yargs = program.Argv;
type Process = any;
type Callback = (status: number) => void;

function success(process: Process, done: Callback) {
	process.stdout.write('Transformation completed successfully.\n');
	done(0);
}

function error(err: string | Error, process: Process, done: Callback) {
	let message = err instanceof Error ? err.message : err;
	process.stdout.write('ERROR: ' + message + '\n');
	done(1);
}

function execute(input: string, output: string, process: any, done: Callback) {
	if (!fs.existsSync(input)) {
		return error('Input file not found: ' + input, process, done);
	}

	fs.readFile(
		input,
		'utf8',
		(err, data) => transform(
			data,
			(err, result) => {
				if (err) {
					return error(err, process, done);
				}
				else {
					fs.writeFile(
						output,
						result,
						'utf8',
						(err) => {
							if (err) {
								return error(err, process, done);
							}
							else {
								return success(process, done);
							}
						}
					);
				}
			}
		)
	);
}

export default function(process: Process, done: Callback) {
	program
		.version()
		.help()
		.usage(
			'$0 <input> <output>',
			'Transforms an input flowtype libdef into typescript definitions.',
			(yargs: Yargs) => (
				yargs
				.positional(
					'input',
					{
						describe: 'source flowtype libdef file',
						type: 'string'
					}
				)
				.positional(
					'output',
					{
						describe: 'destination typescript definition file',
						type: 'string'
					}
				)
				.demandOption(
					['input', 'output'],
					'Both input and output files are required'
				)
			),
			(argv: any) => execute(argv.input, argv.output, process, done)
		)
		.exitProcess(false)
		.parse(
			process.argv.slice(2),
			(err: any, argv: any, output: string) => {
				process.stdout.write(output + '\n');
				done(err ? 1 : 0);
			}
		);
}
