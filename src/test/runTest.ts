//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//
// This file is providing the test runner to use when running extension tests.
// By default the test runner in use is Mocha based.
//
// You can provide your own test runner if you want to override it by exporting
// a function run(testRoot: string, clb: (error:Error) => void) that the extension
// host can call to run the tests. The test runner is expected to use console.log
// to report the results back to the caller. When the tests are finished, return
// a possible error to the callback or null if none.

import * as path from 'node:path';
import * as fs from 'node:fs';
import * as child_process from 'node:child_process';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from '@vscode/test-electron';

// You can directly control Mocha options by uncommenting the following lines
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info

async function getExtensionInstaller(): Promise<string | undefined> {
	const extension = path.resolve(__dirname, '../../');
	const dirElements: string[] = await fs.promises.readdir(extension);
	for (const element of dirElements) {
		if (fs.existsSync(element)) {
			const filePath: string = path.join(extension, element);
			const stat: fs.Stats = await fs.promises.stat(filePath);
			if (stat.isFile() && path.extname(filePath) === '.vsix') {
				return filePath;
			}
		}
	}
	return undefined;
}

async function go() {
    try {
			const extensionDevelopmentPath = path.resolve(__dirname, '../../');
			const extensionTestsPath = path.resolve(__dirname, './suite');
			const testWorkspace = path.resolve(__dirname, '../../src/test-fixtures/fixture1/');

			const extension: string | undefined = await getExtensionInstaller();
			if (typeof extension === 'undefined') {
				throw new Error('Failed to find packaged extension.');
			}

			const vscodeExecutablePath = await downloadAndUnzipVSCode('1.88.0');
			const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
			child_process.spawnSync(cli, [...args, '--install-extension', extension], {
				encoding: 'utf-8',
				stdio: 'inherit'
			});
			child_process.spawnSync(cli, ['-n', testWorkspace, ...args], {
				encoding: 'utf-8',
				stdio: 'inherit'
			});
			await runTests({
				vscodeExecutablePath,
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: [
					testWorkspace,
					// This disables all extensions except the one being tested
					'--disable-extensions',
				]
		});
    } catch (err) {
			console.error('Failed to run tests');
			console.error(err);
			process.exit(1);
    }
}

go();
