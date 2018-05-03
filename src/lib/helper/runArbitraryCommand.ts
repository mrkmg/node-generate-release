/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {spawnSync} from "child_process";

function isCommandAvailable(cmd: string, opts: string[]) {
    const ret = spawnSync(cmd, opts, {stdio: "ignore"});
    return !ret.error;
}

const runner: [string, string[]] | false =
    isCommandAvailable("sh", ["--version"]) ? ["sh", ["-c"]] :
        isCommandAvailable("cmd.exe", ["/v"]) ? ["cmd", ["/s", "/v"]] :
            false;

export function runArbitraryCommand(command: string) {
    if (runner === false) {
        throw new Error("Neither \"sh\" nor \"cmd.exe\" is available on your system.");
    }

    const ret = spawnSync(runner[0], runner[1].concat([command]), {stdio: "pipe"});

    if (ret.error) { throw ret.error; }
    if (ret.status !== 0) { throw new Error(`${command} return ${ret.status}. \n\n ${ret.output}`); }
}
