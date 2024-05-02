import * as http from "https";
import { URL } from "url";

export function httpGet(url: string): Promise<string> {
    const urlObj: URL = new URL(url);
    const { protocol, hostname, pathname } = urlObj;

    return new Promise((resolve, reject) => {
        let data: string = "";

        http.get({ protocol, hostname, pathname }, res => {
            res.on("data", chunk => (data += chunk));
            res.on("end", () => resolve(data));
            res.on("close", () => reject());
        }).on("error", (err) => reject(err));
    });
}

export async function getData(url: string): Promise<string | null> {
    try {
        return Promise.resolve(await httpGet(url));
    } catch (e) {
        return Promise.resolve(null);
    }
}
