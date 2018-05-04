"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var iniparser_1 = require("iniparser");
var path_1 = require("path");
var BRANCH_CONFIG = 'gitflow "branch"';
var PREFIX_CONFIG = 'gitflow "prefix"';
function gitFlowSettings() {
    var file = path_1.resolve(".") + "/.git/config";
    if (!fs_1.existsSync(file)) {
        throw new Error("Git Config File is missing: " + file);
    }
    var iniData = iniparser_1.parseSync(file);
    if (!iniData) {
        throw new Error("Failed to parse init file");
    }
    if (!iniData[BRANCH_CONFIG] || !iniData[BRANCH_CONFIG].master || !iniData[BRANCH_CONFIG].develop) {
        throw new Error("Git config missing git-flow branch configuration");
    }
    if (!iniData[PREFIX_CONFIG] || iniData[PREFIX_CONFIG].versiontag === undefined) {
        throw new Error("Git config missing git-flow prefix configuration");
    }
    return {
        develop: iniData[BRANCH_CONFIG].develop,
        master: iniData[BRANCH_CONFIG].master,
    };
}
exports.gitFlowSettings = gitFlowSettings;
