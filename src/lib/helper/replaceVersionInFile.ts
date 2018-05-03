/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {readFileSync, writeFileSync} from "fs";

export function replaceVersionInFile(filePath: string, currentVersion: string, newVersion: string) {
    writeFileSync(filePath, readFileSync(filePath).toString().replace(currentVersion, newVersion));
}
