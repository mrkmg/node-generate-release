"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
function replaceVersionInFile(filePath, currentVersion, newVersion) {
    fs_1.writeFileSync(filePath, fs_1.readFileSync(filePath).toString().replace(currentVersion, newVersion));
}
exports.replaceVersionInFile = replaceVersionInFile;
