/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {spawnSync} from "child_process";

let runner: [string, string[]];

if (isCommandAvailable("sh", ["--version"])) {
    runner = ["sh", ["-c"]];
} else if (isCommandAvailable("cmd.exe", ["/v"])) {
    runner = ["cmd", ["/s", "/v"]];
} else {
    throw new Error("Neither \"sh\" nor \"cmd.exe\" is available on your system.");
}

function isCommandAvailable(cmd: string, opts: string[]) {
    const ret = spawnSync(cmd, opts, {stdio: "ignore"});
    return !ret.error;
}

export function runArbitraryCommand(command: string) {
    const ret = spawnSync(runner[0], runner[1].concat([command]), {stdio: "pipe"});

    if (ret.error) { throw ret.error; }
    if (ret.status !== 0) { throw new Error(`${command} return ${ret.status}. \n\n ${ret.output}`); }
}
