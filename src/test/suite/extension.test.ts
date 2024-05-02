// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { before } from 'mocha';
import * as path from 'node:path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../../extension';
import Generator from '../../Generator';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {
    vscode.window.showInformationMessage('Start all tests.');

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Defines a Mocha unit test
    test("generate .gitignore", async function() {
        const generator: Generator = new Generator();
        const errors: Error[] = [];
        let output: string | undefined;
        const args: string[] = ["windows"];
        try {
            output = await generator.init(...args);
        } catch (error: unknown) {
            if (error instanceof Error) {
                errors.push(error);
            } else {
                errors.push(new Error(`${error}`));
            }
        }
        if (errors.length > 0) {
            console.log("errors:", errors);
            assert.fail(errors[0]);
        }
        console.log("output:", output);
        assert.ok(output)
    });
});