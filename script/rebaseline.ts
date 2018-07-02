import fs from 'fs-extra';
import path from 'path';
import download = require('download');

const dir = path.resolve(__dirname, '..', 'test', 'fixtures');
const baselines = fs.readJSONSync(path.join(dir, 'baselines.json'));

for (const group in baselines) {
	Promise.all(
		baselines[group].map(({ library, flow }: { library: string, flow: string }) => {
			console.log(`Downloading baseline ${library}/${flow}...`);

			const targetDir = path.join(dir, 'third-party', library.substring(0, library.lastIndexOf('_')));

			return (
				download(
					`https://github.com/flowtype/flow-typed/raw/master/definitions/${group}/${library}/${flow}/${library}.js`,
					targetDir,
					{ filename: 'code.js' }
				)
				.then(() => fs.remove(path.join(targetDir, 'output.js')))
				.catch((err) => console.log(`Error downloading baseline ${library}/${flow}: ${err}`))
			);
		})
	).then(
		() => console.log(`Rebaseline complete for group ${group}.`)
	);
}