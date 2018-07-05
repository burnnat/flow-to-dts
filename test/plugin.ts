import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import pluginTester = require('babel-plugin-tester');

import plugin from '../src/plugin';

pluginTester({
	plugin,
	pluginName: 'flow-to-dts',
	title: 'code sample',
	babelOptions: {
		babelrc: false
	},
	filename: __filename,
	fixtures: 'fixtures/sample'
});

pluginTester({
	plugin,
	pluginName: 'flow-to-dts',
	title: 'third party',
	babelOptions: {
		babelrc: false
	},
	filename: __filename,
	fixtures: 'fixtures/third-party',
	snapshot: true
});

describe('output files', () => {
	const baseDir = path.join(__dirname, 'fixtures/third-party');
	const fixtures = fs.readdirSync(baseDir);
	const truncateErrorLength = 5;

	fixtures.forEach((fixture) => {
		it(fixture, () => {
			const fixtureDir = path.join(baseDir, fixture);
			const typesDir = path.join(fixtureDir, 'types');
			const realOutput = path.join(fixtureDir, 'output.js');
			const virtualOutput = path.join(fixtureDir, 'output.d.ts');

			const host: ts.LanguageServiceHost = {
				getScriptFileNames: () => [virtualOutput].concat(
					fs.existsSync(typesDir)
						? fs.readdirSync(typesDir).map((filename) => path.join(typesDir, filename))
						: []
				),
				getScriptVersion: () => '0',
				getScriptSnapshot: (filename) => {
					if (filename === virtualOutput) {
						filename = realOutput;
					}

					if (!fs.existsSync(filename)) {
						return undefined;
					}

					return ts.ScriptSnapshot.fromString(
						fs.readFileSync(filename).toString()
					);
				},
				getCurrentDirectory: () => __dirname,
				getCompilationSettings: () => ({
					module: ts.ModuleKind.CommonJS
				}),
				getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
				fileExists: ts.sys.fileExists,
				readFile: ts.sys.readFile,
				readDirectory: ts.sys.readDirectory
			};

			const service = ts.createLanguageService(host, ts.createDocumentRegistry());

			service.getEmitOutput(virtualOutput);

			const diagnostics = (
				service.getCompilerOptionsDiagnostics()
					.concat(service.getSyntacticDiagnostics(virtualOutput))
					.concat(service.getSemanticDiagnostics(virtualOutput))
			);

			if (diagnostics.length > 0) {
				throw new Error(
					diagnostics.reduce(
						(acc, diagnostic, index) => {
							if (index === truncateErrorLength) {
								const extraCount = diagnostics.length - truncateErrorLength;
								return `${acc}\n... ${extraCount} additional errors omitted ...`;
							}
							else if (index > truncateErrorLength) {
								return acc;
							}

							let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

							if (diagnostic.file) {
								let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
								message = `[${line + 1}:${character + 1}] ${message}`;
							}

							return acc + '\n' + message;
						},
						'Output file contains compilation errors:'
					)
				);
			}
		});
	});
});
