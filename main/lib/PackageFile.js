"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
var fs_1 = require("fs");
var PackageFile = /** @class */ (function () {
    function PackageFile(packageFileLocation) {
        this.packageFileData = {};
        this.packageFileLocation = packageFileLocation;
    }
    PackageFile.prototype.load = function () {
        this.packageFileData = require(this.packageFileLocation);
    };
    PackageFile.prototype.save = function () {
        var packageString = JSON.stringify(this.packageFileData, null, 2) + "\n";
        fs_1.writeFileSync(this.packageFileLocation, packageString, "utf8");
    };
    PackageFile.prototype.setVersion = function (version) {
        this.packageFileData.version = version;
    };
    PackageFile.prototype.getVersion = function () {
        return this.packageFileData.version;
    };
    return PackageFile;
}());
exports.PackageFile = PackageFile;
