"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Minimist = require("minimist");
var path_1 = require("path");
var extend = require("xtend");
var fs_1 = require("fs");
var options = {
    showHelp: {
        default: false,
        switches: ["h", "help"],
        file_key: false,
        validate: function (input) { return typeof input === "boolean"; },
    },
    quiet: {
        default: false,
        switches: ["q", "quiet"],
        file_key: false,
        validate: function (input) { return typeof input === "boolean"; },
    },
    packageFileLocation: {
        default: "./package.json",
        switches: ["p", "package"],
        file_key: "package_file_location",
        filter: function (input) { return path_1.resolve(input); },
        validate: function (input) { return typeof input === "string" && fs_1.existsSync(input); },
    },
    dotReleaseFileLocation: {
        default: "./.release.json",
        switches: ["d", "release-file"],
        file_key: false,
        filter: function (input) { return path_1.resolve(input); },
        validate: function (input) { return typeof input === "string"; },
    },
    noConfirm: {
        default: false,
        switches: ["n", "no-confirm"],
        file_key: "no_confirm",
        validate: function (input) { return typeof input === "boolean"; },
    },
    releaseType: {
        default: null,
        switches: ["t", "release-type"],
        file_key: "release_type",
        validate: function (input) { return input === null || (typeof input === "string" && (input === "patch" || input === "minor" || input === "major")); },
    },
    currentVersion: {
        default: null,
        switches: ["c", "current-version"],
        file_key: false,
        validate: function (input) { return input === null || typeof input === "string"; },
    },
    nextVersion: {
        default: null,
        switches: ["v", "next-version"],
        file_key: false,
        validate: function (input) { return input === null || typeof input === "string"; },
    },
    remote: {
        default: "origin",
        switches: ["o", "remote"],
        file_key: "remote",
        validate: function (input) { return typeof input === "string"; },
    },
    skipGitPull: {
        default: false,
        switches: ["l", "skip-git-pull"],
        file_key: "skip_git_pull",
        validate: function (input) { return typeof input === "boolean"; },
    },
    skipGitPush: {
        default: false,
        switches: ["s", "skip-git-push"],
        file_key: "skip_git_push",
        validate: function (input) { return typeof input === "boolean"; },
    },
    skipGitFlowFinish: {
        default: false,
        switches: ["f", "skip-git-flow-finish"],
        file_key: "skip_git_flow_finish",
        validate: function (input) { return typeof input === "boolean"; },
    },
    releaseMessage: {
        default: "Release {version}",
        switches: ["m", "set-release-message"],
        file_key: "release_message",
        filter: function (input) {
            if (input === false) {
                return "Release {version}";
            }
            else {
                return input;
            }
        },
        validate: function (input) { return input === true || typeof input === "string"; },
    },
    preCommitCommands: {
        default: [],
        switches: false,
        file_key: "pre_commit_commands",
        validate: function (input) { return Array.isArray(input); },
    },
    postCommitCommands: {
        default: [],
        switches: false,
        file_key: "post_commit_commands",
        validate: function (input) { return Array.isArray(input); },
    },
    postCompleteCommands: {
        default: [],
        switches: false,
        file_key: "post_complete_commands",
        validate: function (input) { return Array.isArray(input); },
    },
    filesToVersion: {
        default: ["README.md"],
        switches: false,
        file_key: "files_to_version",
        validate: function (input) { return Array.isArray(input); },
    },
    filesToCommit: {
        default: [],
        switches: false,
        file_key: "files_to_commit",
        validate: function (input) { return Array.isArray(input); },
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
        if (this.fileData[fileKey]) {
            return this.fileData[fileKey];
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
