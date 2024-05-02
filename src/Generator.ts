import * as path from "path";
import { window, workspace, Disposable, WorkspaceFolder, QuickPickItem } from "vscode";
import { API_URL, ALTERNATIVE_API_URL, FILE_NAME, MESSAGES } from "./modules/config";
import {
    getFolderOption,
    getItemsOption,
    getOverrideOption,
    openFile,
    openUntitledFile,
} from "./modules/ui";
import { fileExists, hasFolder, writeFile } from "./modules/filesystem";
import { getData } from "./modules/http";
import { IListChoice, generateFile, getList, hitAntiDdos } from "./modules/helpers";

export default class Generator {
    private folders = workspace.workspaceFolders;
    private filePath: string | null = null;
    private override: boolean = true;
    private selected: string[] = [];

    public async init(): Promise<void> {
        this.filePath = await this.getFilePath();

        if (this.filePath) {
            this.override = await this.getOverrideOption();
        }

        this.selected = await this.getSelectedOptions();
        this.generate();
    }

    private async get1<T, K>(fn: (arg: T) => PromiseLike<K>, ...args: [arg: T]): Promise<K> {
        const result: K = await fn.apply(this, args);

        if (result === undefined) {
            this.abort();
        }

        return result;
    }

    private async get2<T>(fn: () => PromiseLike<T>): Promise<T> {
        const result: T = await fn.apply(this, []);

        if (result === undefined) {
            this.abort();
        }

        return result;
    }

    private async getFilePath(): Promise<string | null>{
        if (!this.folders || !hasFolder(this.folders)) {
            return null;
        }

        const folderName: string | undefined =
            this.folders.length > 1
                ? await this.get1<readonly WorkspaceFolder[], string | undefined>(getFolderOption, this.folders)
                : this.folders[0].name;

        if (!folderName) {
            return null;
        }

        const workspaceFolder: WorkspaceFolder | undefined = this.folders.find(
            folder => folder.name === folderName
        );
        if (!workspaceFolder) {
            return null;
        }
        const folderPath: string = workspaceFolder.uri.fsPath;

        return path.join(folderPath, FILE_NAME);
    }

    private async getOverrideOption(): Promise<boolean> {
        if (!this.filePath || !fileExists(this.filePath)) {
            return true;
        }
        const options: boolean | undefined = await this.get2<boolean | undefined>(getOverrideOption);
        if (!options) {
            return true;
        }
        return options;
    }

    private async getSelectedOptions(): Promise<string[]> {
        const message: Disposable = window.setStatusBarMessage(MESSAGES.fetching);

        const list: IListChoice[] | null = await getList(this.filePath, !this.override);

        message.dispose();

        if (list === null) {
            return new Promise((resolve, reject) => window.showErrorMessage(MESSAGES.network_error).then((value) => value ? resolve([value]) : resolve([]), (reason) => reject(reason)));
        }

        const picked: string[] | undefined = await this.get1<QuickPickItem[], string[] | undefined>(getItemsOption, list);
        if (!picked) {
            return new Promise((resolve, reject) => window.showErrorMessage(MESSAGES.network_error).then((value) => value ? resolve([value]) : resolve([]), (reason) => reject(reason)));
        }
        return picked;
    }

    private async generate(): Promise<string | undefined> {
        const message: Disposable = window.setStatusBarMessage(MESSAGES.generating);

        let data: string | null = await getData(`${API_URL}/${this.selected.join(",")}`);

        if(hitAntiDdos(data)) {
            data = await getData(`${ALTERNATIVE_API_URL}/${this.selected.join(",")}`);
        }

        if (data === null) {
            return window.showErrorMessage(MESSAGES.network_error);
        }
        if (this.filePath === null) {
            return window.showErrorMessage(MESSAGES.save_error);
        }

        const output: string = generateFile(this.filePath, data, this.override);

        if (this.filePath) {
            const result: boolean = writeFile(this.filePath, output);

            if (result === false) {
                message.dispose();
                window.showErrorMessage(MESSAGES.save_error);
                this.abort();
            }

            openFile(this.filePath);
        } else {
            openUntitledFile(output);
        }

        message.dispose();

        window.setStatusBarMessage(
            MESSAGES.generated.replace(
                "[action]",
                this.override ? "created" : "updated"
            ),
            3000
        );
    }

    private abort(): void {
        throw new Error("Extension action aborted");
    }
}
