import fs from 'fs';

import transform from './index';

fs.readFile(
	process.argv[2],
	'utf8',
	(err, data) => transform(
		data,
		(err, result) => {
			if (err) {
				console.error(err.toString());
			}
			else {
				console.log(result);
			}
		}
	)
);