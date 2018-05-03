"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer_1 = require("inquirer");
var INFO_MESSAGE = "\n# Please write your release message above\n#\n# Any line which starts with \"#\" will be ignored.\n";
function askReleaseMessage(newVersion) {
    var args = {
        default: "Release " + newVersion + "\n\n\n" + INFO_MESSAGE,
        filter: function (result) { return result.replace(/^#.*$/gm, "").replace(/\n+$/g, ""); },
        message: "Please write a release message.",
        name: "message",
        type: "editor",
        validate: function (result) { return result.length === 0 ? "Release message can not be empty." : true; },
    };
    return inquirer_1.prompt(args).then(function (result) { return result.message; });
}
exports.askReleaseMessage = askReleaseMessage;
