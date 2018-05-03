"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer_1 = require("inquirer");
function askReleaseType() {
    var args = {
        choices: ["patch", "minor", "major"],
        default: "patch",
        message: "Release Type",
        name: "release",
        type: "list",
    };
    return inquirer_1.prompt(args).then(function (result) { return result.release; });
}
exports.askReleaseType = askReleaseType;
