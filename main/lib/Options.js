"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var Minimist = require("minimist");
var path_1 = require("path");
var extend = require("xtend");
var options = {
    currentVersion: {
        default: null,
        file_key: false,
        switches: ["c", "current-version"],
        validate: function (input) { return input === null || typeof input === "string"; },
    },
    dotReleaseFileLocation: {
        default: "./.release.json",
        file_key: false,
        filter: function (input) { return path_1.resolve(input); },
        switches: ["d", "release-file"],
        validate: function (input) { return typeof input === "string"; },
    },
    filesToCommit: {
        default: [],
        file_key: "files_to_commit",
        switches: false,
        validate: function (input) { return Array.isArray(input); },
    },
    filesToVersion: {
        default: ["README.md"],
        file_key: "files_to_version",
        switches: false,
        validate: function (input) { return Array.isArray(input); },
    },
    nextVersion: {
        default: null,
        file_key: false,
        switches: ["v", "next-version"],
        validate: function (input) { return input === null || typeof input === "string"; },
    },
    noConfirm: {
        default: false,
        file_key: "no_confirm",
        switches: ["n", "no-confirm"],
        validate: function (input) { return typeof input === "boolean"; },
    },
    packageFileLocation: {
        default: "./package.json",
        file_key: "package_file_location",
        filter: function (input) { return path_1.resolve(input); },
        switches: ["p", "package"],
        validate: function (input) { return typeof input === "string" && fs_1.existsSync(input); },
    },
    postCommitCommands: {
        default: [],
        file_key: "post_commit_commands",
        switches: false,
        validate: function (input) { return Array.isArray(input); },
    },
    postCompleteCommands: {
        default: [],
        file_key: "post_complete_commands",
        switches: false,
        validate: function (input) { return Array.isArray(input); },
    },
    preCommitCommands: {
        default: [],
        file_key: "pre_commit_commands",
        switches: false,
        validate: function (input) { return Array.isArray(input); },
    },
    quiet: {
        default: false,
        file_key: false,
        switches: ["q", "quiet"],
        validate: function (input) { return typeof input === "boolean"; },
    },
    releaseMessage: {
        default: "Release {version}",
        file_key: "release_message",
        filter: function (input) {
            if (input === false) {
                return "Release {version}";
            }
            else {
                return input;
            }
        },
        switches: ["m", "set-release-message"],
        validate: function (input) { return input === true || typeof input === "string"; },
    },
    releaseType: {
        default: null,
        file_key: "release_type",
        switches: ["t", "release-type"],
        validate: function (input) { return input === null ||
            (typeof input === "string" && (input === "patch" || input === "minor" || input === "major")); },
    },
    remote: {
        default: "origin",
        file_key: "remote",
        switches: ["o", "remote"],
        validate: function (input) { return typeof input === "string"; },
    },
    showHelp: {
        default: false,
        file_key: false,
        switches: ["h", "help"],
        validate: function (input) { return typeof input === "boolean"; },
    },
    skipFinish: {
        default: false,
        file_key: ["skip_finish", "skip_git_flow_finish"],
        switches: ["f", "skip-finish", "skip-git-flow-finish"],
        validate: function (input) { return typeof input === "boolean"; },
    },
    skipGitPull: {
        default: false,
        file_key: "skip_git_pull",
        switches: ["l", "skip-git-pull"],
        validate: function (input) { return typeof input === "boolean"; },
    },
    skipGitPush: {
        default: false,
        file_key: "skip_git_push",
        switches: ["s", "skip-git-push"],
        validate: function (input) { return typeof input === "boolean"; },
    },
};
var Options = /** @class */ (function () {
    function Options(args) {
        this.fileData = {};
        this.args = Minimist(args.slice(2));
        this.getOption("dotReleaseFileLocation", options.dotReleaseFileLocation);
        this.getOption("packageFileLocation", options.packageFileLocation);
        this.loadPackageConfig();
        this.loadFileData();
        this.getAllOptions();
    }
    Options.prototype.getOption = function (key, opts) {
        var value;
        if (opts.switches) {
            value = this.getSwitchValue(opts.switches);
        }
        if (value === undefined && opts.file_key !== false) {
            value = this.getFileValue(opts.file_key);
        }
        if (value === undefined) {
            value = opts.default;
        }
        if (opts.filter) {
            value = opts.filter(value);
        }
        if (opts.validate && !opts.validate(value)) {
            throw new Error("Invalid Value for " + key + ": " + value);
        }
        this[key] = value;
    };
    Options.prototype.getAllOptions = function () {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                this.getOption(key, options[key]);
            }
        }
    };
    Options.prototype.getSwitchValue = function (switches) {
        for (var _i = 0, switches_1 = switches; _i < switches_1.length; _i++) {
            var s = switches_1[_i];
            if (this.args[s]) {
                return this.args[s];
            }
        }
    };
    Options.prototype.getFileValue = function (fileKey) {
        if (Array.isArray(fileKey)) {
            for (var _i = 0, fileKey_1 = fileKey; _i < fileKey_1.length; _i++) {
                var key = fileKey_1[_i];
                if (this.fileData[key]) {
                    return this.fileData[key];
                }
            }
        }
        else {
            if (this.fileData[fileKey]) {
                return this.fileData[fileKey];
            }
        }
    };
    Options.prototype.loadFileData = function () {
        if (fs_1.existsSync(this.dotReleaseFileLocation)) {
            this.fileData = extend(this.fileData, require(this.dotReleaseFileLocation));
        }
    };
    Options.prototype.loadPackageConfig = function () {
        if (fs_1.existsSync(this.packageFileLocation)) {
            var packageJson = require(this.packageFileLocation);
            if (packageJson.config && packageJson.config.generateRelease) {
                this.fileData = extend(this.fileData, packageJson.config.generateRelease);
            }
        }
    };
    return Options;
}());
exports.Options = Options;
