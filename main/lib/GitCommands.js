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
var gitFlowSettings_1 = require("./helper/gitFlowSettings");
var gitStreamSettings_1 = require("./helper/gitStreamSettings");
var env = process.env;
env.GIT_MERGE_AUTOEDIT = "no";
var AVH_EDITION_REGEX = /AVH Edition/;
var RepoType;
(function (RepoType) {
    RepoType[RepoType["GitFlow"] = 0] = "GitFlow";
    RepoType[RepoType["GitStream"] = 1] = "GitStream";
})(RepoType || (RepoType = {}));
var GitCommands = /** @class */ (function () {
    function GitCommands(opts) {
        this.isAvh = false;
        this.skipFinish = false;
        this.releaseMessage = "release/" + this.nextVersion;
        if (opts.currentVersion) {
            this.currentVersion = opts.currentVersion;
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
        this.repoType = GitCommands.getRepoType();
        switch (this.repoType) {
            case RepoType.GitFlow:
                var gfSettings = gitFlowSettings_1.gitFlowSettings();
                this.masterBranch = gfSettings.master;
                this.developBranch = gfSettings.develop;
                this.isAvh = GitCommands.isAvhEdition();
                break;
            case RepoType.GitStream:
                var gsSettings = gitStreamSettings_1.gitStreamSettings();
                this.developBranch = gsSettings.develop;
        }
        if (!opts.currentVersion) {
            throw new Error("Current Version is not set.");
        }
        if (!opts.nextVersion) {
            throw new Error("Next Version is not set.");
        }
    }
    GitCommands.getRepoType = function () {
        var gitConfigData = fs_1.readFileSync("./.git/config").toString();
        if (/\[gitstream/.test(gitConfigData)) {
            return RepoType.GitStream;
        }
        if (/\[gitflow/.test(gitConfigData)) {
            return RepoType.GitFlow;
        }
        throw new Error("Unknown Git Plugin");
    };
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
        if (this.repoType === RepoType.GitFlow) {
            GitCommands.git("checkout", this.masterBranch);
            GitCommands.git("reset", "--hard", this.remote + "/" + this.masterBranch);
        }
    };
    GitCommands.prototype.push = function () {
        if (this.skipFinish) {
            GitCommands.git("push", "-u", this.remote, this.releaseBranch);
        }
        else {
            GitCommands.git("push", this.remote, this.developBranch);
            if (this.repoType === RepoType.GitFlow) {
                GitCommands.git("push", this.remote, this.masterBranch);
            }
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
        switch (this.repoType) {
            case RepoType.GitFlow:
                GitCommands.git("checkout", this.developBranch);
                GitCommands.git("flow", "release", "start", this.nextVersion);
                break;
            case RepoType.GitStream:
                GitCommands.git("checkout", this.developBranch);
                GitCommands.git("stream", "release", "start", this.nextVersion);
                break;
        }
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
        switch (this.repoType) {
            case RepoType.GitFlow:
                this.isAvh ?
                    this.finishGitFlowAvh() :
                    GitCommands.git("flow", "release", "finish", "-m", this.releaseMessage, this.nextVersion);
                break;
            case RepoType.GitStream:
                GitCommands.git("stream", "release", "finish", "-p", "-m", this.releaseMessage, this.nextVersion);
                break;
        }
    };
    GitCommands.prototype.finishGitFlowAvh = function () {
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
