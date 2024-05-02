"use strict";

import { ExtensionContext, commands, Disposable } from "vscode";
import Generator from "./Generator";

export function activate(context: ExtensionContext) {
    const disposable: Disposable = commands.registerCommand(
        "extension.gitignoreGenerate",
        (...args: string[]) => {
            try {
                const generator = new Generator();

                generator.init(...args);
            } catch (e) {
                if (e instanceof Error) {
                    console.error(e.message);
                } else  {
                    console.error(e);
                }
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
