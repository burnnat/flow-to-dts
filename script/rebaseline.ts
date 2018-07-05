import fs from 'fs-extra';
import path from 'path';
import download = require('download');

const dir = path.resolve(__dirname, '..', 'test', 'fixtures');
const baselines = fs.readJSONSync(path.join(dir, 'baselines.json'));

interface TypeLibrary {
	library: string;
	version: string;
}

interface Baseline {
	library: string;
	flow: string;
	types: TypeLibrary[] | null
}

for (const group in baselines) {
	Promise.all(
		baselines[group].map(({ library, flow, types }: Baseline) => {
			console.log(`Downloading baseline ${library}/${flow}...`);

			const targetDir = path.join(dir, 'third-party', library.substring(0, library.lastIndexOf('_')));
			const typesDir = path.join(targetDir, 'types');

			return (
				download(
					`https://github.com/flowtype/flow-typed/raw/master/definitions/${group}/${library}/${flow}/${library}.js`,
					targetDir,
					{ filename: 'code.js' }
				)
				.then(() => Promise.all(
					(types || []).map(
						(type) => download(
							`https://github.com/DefinitelyTyped/DefinitelyTyped/raw/master/types/${type.library}/${type.version}/index.d.ts`,
							typesDir,
							{ filename: type.library + '.d.ts' }
						)
					)
				))
				.then(() => fs.remove(path.join(targetDir, 'output.js')))
				.catch((err) => console.log(`Error downloading baseline ${library}/${flow}: ${err}`))
			);
		})
	).then(
		() => console.log(`Rebaseline complete for group ${group}.`)
	);
}