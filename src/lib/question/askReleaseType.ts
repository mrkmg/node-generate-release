/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {prompt} from "inquirer";

export function askReleaseType(): Promise<"patch" | "minor" | "major"> {
    const args = {
        choices: ["patch", "minor", "major"],
        default: "patch",
        message: "Release Type",
        name: "release",
        type: "list",
    };

    return prompt(args).then((result: any) => result.release as "patch" | "minor" | "major");
}
