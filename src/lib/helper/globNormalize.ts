/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {sync} from "glob";
import {resolve} from "path";

type MultiLevelStringedArray = string | string[] | string[][] | string[][][] | string[][][][] | string[][][][][];

export function globNormalize(...params: MultiLevelStringedArray[]) {
    let files: string[] = [];

    for (const item of params) {
        if (typeof item === "string") {
            files = files.concat(sync(item).map((f) => resolve(f)));
        } else if (Array.isArray(item)) {
            const tmpFiles = globNormalize.apply({}, item);
            files = files.concat(tmpFiles);
        }
    }

    return files.sort().filter((item, pos, self) => pos === 0 || item !== self[pos - 1]);
}
