import fs from 'fs-extra';
import program from 'yargs';

import transform from './index';

type Yargs = program.Argv;
type Process = any;
type Callback = (status: number) => void;

function execute(input: string, output: string) {
	if (!fs.existsSync(input)) {
		return Promise.reject('Input file not found: ' + input);
	}
	else {
		return (
			fs.readFile(input, 'utf8')
				.then(transform)
				.then((result) => fs.writeFile(output, result, 'utf8'))
				.then(() => 'Transformation completed successfully.\n')
		);
	}
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
			(argv: any) => argv.promise = execute(argv.input, argv.output)
		)
		.exitProcess(false)
		.fail(() => {})
		.parse(
			process.argv.slice(2),
			(err: any, argv: any, output: string) => {
				if (output != null) {
					process.stdout.write(output + '\n');
				}

				const promise = argv.promise || Promise.resolve('');

				promise
					.then((msg: string) => {
						process.stdout.write(msg + '\n');
						done(0);
					})
					.catch((err: string) => {
						process.stdout.write(err + '\n');
						done(1);
					});
			}
		);
}
