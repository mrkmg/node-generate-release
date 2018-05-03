/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

const VERSION_REGEX = /([0-9]+\.[0-9]+\.[0-9]+)/;

export function incrementVersion(version: string, type: "patch" | "minor" | "major") {
    if (!VERSION_REGEX.test(version)) {
        throw new Error(`Version does not match semver ${version}`);
    }

    const versionSplit = version.match(VERSION_REGEX)[0].split(".").map((t) => +t);

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
            throw new Error(`Unknown Bump Type: ${type}`);
    }

    return versionSplit.join(".");
}
