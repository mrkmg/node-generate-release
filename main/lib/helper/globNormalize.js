"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var glob_1 = require("glob");
var path_1 = require("path");
function globNormalize() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    var files = [];
    for (var _a = 0, params_1 = params; _a < params_1.length; _a++) {
        var item = params_1[_a];
        if (typeof item === "string") {
            files = files.concat(glob_1.sync(item).map(function (f) { return path_1.resolve(f); }));
        }
        else if (Array.isArray(item)) {
            var tmpFiles = globNormalize.apply({}, item);
            files = files.concat(tmpFiles);
        }
    }
    return files.sort().filter(function (item, pos, self) { return pos === 0 || item !== self[pos - 1]; });
}
exports.globNormalize = globNormalize;
