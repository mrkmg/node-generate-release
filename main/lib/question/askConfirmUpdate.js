"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer_1 = require("inquirer");
function askConfirmUpdate(currentVersion, newVersion) {
    var args = {
        message: "Are you sure you want to update the release from " + currentVersion + " to " + newVersion,
        name: "confirm",
        type: "confirm",
    };
    return inquirer_1.prompt(args).then(function (r) { return r.confirm; });
}
exports.askConfirmUpdate = askConfirmUpdate;
