/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {prompt} from "inquirer";

export function askReleaseType(): Promise<"patch" | "minor" | "major"> {
    const args = {
        type: "list",
        name: "release",
        message: "Release Type",
        default: "patch",
        choices: ["patch", "minor", "major"],
    };

    return prompt(args).then((result: any) => result.release as "patch" | "minor" | "major");
}
