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
var BRANCH_CONFIG = 'gitstream "branch"';
var PREFIX_CONFIG = 'gitstream "prefix"';
function gitStreamSettings() {
    var file = path_1.resolve(".") + "/.git/config";
    if (!fs_1.existsSync(file)) {
        throw new Error("Git Config File is missing: " + file);
    }
    var iniData = iniparser_1.parseSync(file);
    if (!iniData) {
        throw new Error("Failed to parse init file");
    }
    if (!iniData[BRANCH_CONFIG] || !iniData[BRANCH_CONFIG].working) {
        throw new Error("Git config missing git-stream branch configuration");
    }
    return {
        develop: iniData[BRANCH_CONFIG].working,
    };
}
exports.gitStreamSettings = gitStreamSettings;
