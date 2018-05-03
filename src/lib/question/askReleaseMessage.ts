/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {prompt} from "inquirer";

const INFO_MESSAGE = `
# Please write your release message above
#
# Any line which starts with "#" will be ignored.
`;

export function askReleaseMessage(newVersion: string): Promise<string> {
    const args = {
        type: "editor",
        name: "message",
        message: "Please write a release message.",
        default: `Release ${newVersion}\n\n\n${INFO_MESSAGE}`,
        filter: (result: string) => result.replace(/^#.*$/gm, "").replace(/\n+$/g, ""),
        validate: (result: string) => result.length === 0 ? "Release message can not be empty." : true,
    };

    return prompt(args).then((result: any) => result.message as string);
}
