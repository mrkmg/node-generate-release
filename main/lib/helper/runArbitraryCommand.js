"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var runner;
if (isCommandAvailable("sh", ["--version"])) {
    runner = ["sh", ["-c"]];
}
else if (isCommandAvailable("cmd.exe", ["/v"])) {
    runner = ["cmd", ["/s", "/v"]];
}
else {
    throw new Error("Neither \"sh\" nor \"cmd.exe\" is available on your system.");
}
function isCommandAvailable(cmd, opts) {
    var ret = child_process_1.spawnSync(cmd, opts, { stdio: "ignore" });
    return !ret.error;
}
function runArbitraryCommand(command) {
    var ret = child_process_1.spawnSync(runner[0], runner[1].concat([command]), { stdio: "pipe" });
    if (ret.error) {
        throw ret.error;
    }
    if (ret.status !== 0) {
        throw new Error(command + " return " + ret.status + ". \n\n " + ret.output);
    }
}
exports.runArbitraryCommand = runArbitraryCommand;
