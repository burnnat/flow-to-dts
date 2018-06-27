import fs from 'fs';
import program from 'commander';

import project from '../package.json';
import transform from './index';

export default function(process: any, done: (status: number) => void) {
	program
		.name('flow-to-dts')
		.version(project.version)
		.usage('<input-file> <output-file>')
		.parse(process.argv);

	if (program.args.length < 2) {
		program.help();
	}

	const [input, output] = program.args;

	if (!fs.existsSync(input)) {
		throw new Error('Input file not found: ' + input);
	}

	fs.readFile(
		input,
		'utf8',
		(err, data) => transform(
			data,
			(err, result) => {
				if (err) {
					console.error(err);
					done(-1);
				}
				else {
					fs.writeFile(
						output,
						result,
						'utf8',
						(err) => {
							if (err) {
								console.error(err);
								done(-2);
							}
							else {
								done(0);
							}
						}
					);
				}
			}
		)
	);
}
