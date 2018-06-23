import fs from 'fs';

import transform from './index';

const input: string = process.argv[2];
const output: string = process.argv[3];

fs.readFile(
	input,
	'utf8',
	(err, data) => transform(
		data,
		(err, result) => {
			if (err) {
				console.error(err.toString());
			}
			else {
				fs.writeFile(
					output,
					result,
					'utf8',
					(err) => {
						if (err) {
							console.error(err);
						}
					}
				);
			}
		}
	)
);