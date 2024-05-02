import { existsSync, readFileSync, writeFileSync } from "fs";
import { WorkspaceFolder } from "vscode";

export function readFile(path: string) {
    try {
        return readFileSync(path, { encoding: "utf-8" });
    } catch (e) {
        return null;
    }
}

export function writeFile(path: string, content: string) {
    try {
        writeFileSync(path, content);
        return true;
    } catch (e) {
        return false;
    }
}

export function fileExists(path: string) {
    return existsSync(path);
}

export function hasFolder(folders: readonly WorkspaceFolder[] | undefined) {
    return folders && folders.length > 0 ? true : false;
}
