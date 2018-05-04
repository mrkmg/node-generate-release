"use strict";
/**
 * Generate Release
 * Kevin Gravier
 * MIT License
 */
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var temp_1 = require("temp");
var UncleanWorkingDirectoryError_1 = require("./error/UncleanWorkingDirectoryError");
var env = process.env;
env.GIT_MERGE_AUTOEDIT = "no";
var AVH_EDITION_REGEX = /AVH Edition/;
var GitCommands = /** @class */ (function () {
    function GitCommands(opts) {
        this.developBranch = "develop";
        this.isAvh = false;
        this.masterBranch = "master";
        this.skipFinish = false;
        this.releaseMessage = "release/" + this.nextVersion;
        if (opts.currentVersion) {
            this.currentVersion = opts.currentVersion;
        }
        if (opts.developBranch) {
            this.developBranch = opts.developBranch;
        }
        if (opts.masterBranch) {
            this.masterBranch = opts.masterBranch;
        }
        if (opts.nextVersion) {
            this.nextVersion = opts.nextVersion;
        }
        if (opts.releaseMessage) {
            this.releaseMessage = opts.releaseMessage;
        }
        if (opts.remote) {
            this.remote = opts.remote;
        }
        if (opts.skipFinish) {
            this.skipFinish = opts.skipFinish;
        }
        this.isAvh = GitCommands.isAvhEdition();
        if (!opts.currentVersion) {
            throw new Error("Current Version is not set.");
        }
        if (!opts.nextVersion) {
            throw new Error("Next Version is not set.");
        }
    }
    GitCommands.isAvhEdition = function () {
        var versionResult = child_process_1.execSync("git flow version", { env: env });
        return AVH_EDITION_REGEX.test(versionResult.toString());
    };
    GitCommands.checkForCleanWorkingDirectory = function () {
        try {
            child_process_1.execSync("git diff-index --quiet HEAD --", { env: env });
        }
        catch (e) {
            throw new UncleanWorkingDirectoryError_1.UncleanWorkingDirectoryError();
        }
    };
    GitCommands.git = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result = child_process_1.spawnSync("git", args, { env: env, stdio: "pipe" });
        if (result.status !== 0) {
            throw new Error("git " + args.join(" ") + " returned " + result.status + ". \n\n Output: \n\n " + result.stderr);
        }
        return result.stdout ? result.stdout.toString() : "";
    };
    GitCommands.addDeletedFiles = function () {
        var files = GitCommands.git("ls-files", "--deleted").split("\n");
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            if (file !== "") {
                GitCommands.git("rm", "--cached", file);
            }
        }
    };
    GitCommands.prototype.pull = function () {
        GitCommands.git("fetch", this.remote);
        GitCommands.git("checkout", this.developBranch);
        GitCommands.git("pull", this.remote, this.developBranch, "--rebase");
        GitCommands.git("checkout", this.masterBranch);
        GitCommands.git("reset", "--hard", this.remote + "/" + this.masterBranch);
    };
    GitCommands.prototype.push = function () {
        if (this.skipFinish) {
            GitCommands.git("push", "-u", this.remote, this.releaseBranch);
        }
        else {
            GitCommands.git("push", this.remote, this.developBranch);
            GitCommands.git("push", this.remote, this.masterBranch);
            GitCommands.git("push", this.remote, "--tags");
        }
    };
    GitCommands.prototype.reset = function () {
        GitCommands.git("checkout", this.developBranch);
        GitCommands.git("reset", "--hard", "HEAD");
        try {
            GitCommands.git("branch", "-D", "release/" + this.nextVersion);
        }
        catch (e) {
            // It is safe to throw this away in case the next release branch was not yet made
        }
    };
    GitCommands.prototype.start = function () {
        GitCommands.git("checkout", this.developBranch);
        GitCommands.git("flow", "release", "start", this.nextVersion);
    };
    GitCommands.prototype.commit = function (files) {
        GitCommands.addDeletedFiles();
        for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
            var file = files_2[_i];
            GitCommands.git("add", file);
        }
        GitCommands.git("commit", "-m", this.releaseMessage);
    };
    GitCommands.prototype.finish = function () {
        this.isAvh ? this.finishAvh() : this.finishNonAvh();
    };
    GitCommands.prototype.finishNonAvh = function () {
        GitCommands.git("flow", "release", "finish", "-m", this.releaseMessage, this.nextVersion);
    };
    GitCommands.prototype.finishAvh = function () {
        var releaseMessageFile = temp_1.path();
        fs_1.writeFileSync(releaseMessageFile, this.releaseMessage);
        try {
            GitCommands.git("flow", "release", "finish", "-f", releaseMessageFile, this.nextVersion);
        }
        finally {
            fs_1.unlinkSync(releaseMessageFile);
        }
    };
    return GitCommands;
}());
exports.GitCommands = GitCommands;
