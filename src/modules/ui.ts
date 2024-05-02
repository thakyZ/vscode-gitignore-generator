import { window, workspace, QuickPickItem, WorkspaceFolder, Uri, commands } from "vscode";
import { OVERRIDE_OPTIONS, PLACEHOLDERS } from "./config";

export function getFolderOption(folders: readonly WorkspaceFolder[]): Thenable<string | undefined> {
    const options = folders.map(folder => folder.name);

    return window.showQuickPick(options, {
        placeHolder: PLACEHOLDERS.location,
    });
}

export async function getOverrideOption(): Promise<boolean | undefined> {
    const option = await window.showQuickPick(OVERRIDE_OPTIONS, {
        placeHolder: PLACEHOLDERS.override,
    });
    if (option === undefined) {
        return undefined;
    }
    return option === OVERRIDE_OPTIONS[0] ? true : false;
}

export async function getItemsOption(items: QuickPickItem[]): Promise<string[] | undefined> {
    const selected = await window.showQuickPick(items, {
        canPickMany: true,
        placeHolder: PLACEHOLDERS.selection_hint,
    });
    if (selected === undefined || selected.length === 0) {
        return undefined;
    }
    return selected.map(item => item.label);
}

export function openFile(filePath: string): void {
    commands.executeCommand("vscode.open", Uri.file(filePath));
}

export function openUntitledFile(content: string): void {
    workspace.openTextDocument({ content }).then(doc => {
        window.showTextDocument(doc);
    });
}
