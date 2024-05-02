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
import * as cp from 'node:child_process';
import { runTests, downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';

// You can directly control Mocha options by uncommenting the following lines
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info

async function go() {
    try {
      const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
			const extensionTestsPath = path.resolve(__dirname, './suite');

			/**
			 * Basic usage
			 */
					await runTests({
				extensionDevelopmentPath,
				extensionTestsPath,
			});

			const testWorkspace = path.resolve(__dirname, '../../../test-fixtures/fixture1');

			/**
			 * Running another test suite on a specific workspace
			 */
			await runTests({
				extensionDevelopmentPath,
				extensionTestsPath: extensionTestsPath,
				launchArgs: [testWorkspace],
			});

			/**
			 * Use 1.36.1 release for testing
			 */
			await runTests({
				version: '1.36.1',
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: [testWorkspace],
			});

			/**
			 * Use Insiders release for testing
			 */
			await runTests({
				version: 'insiders',
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: [testWorkspace],
			});

			/**
			 * Noop, since 1.36.1 already downloaded to .vscode-test/vscode-1.36.1
			 */
			await downloadAndUnzipVSCode('1.36.1');

			/**
			 * Manually download VS Code 1.35.0 release for testing.
			 */
			const vscodeExecutablePath = await downloadAndUnzipVSCode('1.35.0');
			await runTests({
				vscodeExecutablePath,
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: [testWorkspace],
			});

			/**
			 * Install Python extension
			 */
			const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
			cp.spawnSync(cli, [...args, '--install-extension', 'ms-python.python'], {
				encoding: 'utf-8',
				stdio: 'inherit',
			});

			/**
			 * - Add additional launch flags for VS Code
			 * - Pass custom environment variables to test runner
			 */
			await runTests({
				vscodeExecutablePath,
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: [
					testWorkspace,
					// This disables all extensions except the one being tested
					'--disable-extensions',
				],
				// Custom environment variables for extension test script
				extensionTestsEnv: { foo: 'bar' },
			});

			/**
			 * Use win64 instead of win32 for testing Windows
			 */
			if (process.platform === 'win32') {
				await runTests({
					extensionDevelopmentPath,
					extensionTestsPath,
					version: '1.40.0',
					platform: 'win32-x64-archive',
				});
			}
    } catch (err) {
			console.error('Failed to run tests');
			console.error(err);
			process.exit(1);
    }
}

go();
