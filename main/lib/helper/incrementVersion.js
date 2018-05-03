"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var VERSION_REGEX = /([0-9]+\.[0-9]+\.[0-9]+)/;
function incrementVersion(version, type) {
    if (!VERSION_REGEX.test(version)) {
        throw new Error("Version does not match semver " + version);
    }
    var versionSplit = version.match(VERSION_REGEX)[0].split(".").map(function (t) { return +t; });
    switch (type) {
        case "patch":
            versionSplit[2]++;
            break;
        case "minor":
            versionSplit[1]++;
            versionSplit[2] = 0;
            break;
        case "major":
            versionSplit[0]++;
            versionSplit[1] = 0;
            versionSplit[2] = 0;
            break;
        default:
            throw new Error("Unknown Bump Type: " + type);
    }
    return versionSplit.join(".");
}
exports.incrementVersion = incrementVersion;
