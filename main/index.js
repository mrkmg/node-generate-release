"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("es6-shim");
var UncleanWorkingDirectoryError_1 = require("./lib/error/UncleanWorkingDirectoryError");
var path_1 = require("path");
var GitCommands_1 = require("./lib/GitCommands");
var Options_1 = require("./lib/Options");
var PackageFile_1 = require("./lib/PackageFile");
var GitResetError_1 = require("./lib/error/GitResetError");
var HelpError_1 = require("./lib/error/HelpError");
var askConfirmUpdate_1 = require("./lib/question/askConfirmUpdate");
var askReleaseMessage_1 = require("./lib/question/askReleaseMessage");
var askReleaseType_1 = require("./lib/question/askReleaseType");
var gitFlowSettings_1 = require("./lib/helper/gitFlowSettings");
var globNormalize_1 = require("./lib/helper/globNormalize");
var incrementVersion_1 = require("./lib/helper/incrementVersion");
var replaceVersionInFile_1 = require("./lib/helper/replaceVersionInFile");
var runArbitraryCommand_1 = require("./lib/helper/runArbitraryCommand");
var Observatory = require("observatory");
var IS_DEBUG = !!process.env.IS_DEBUG;
function main(args) {
    return __awaiter(this, void 0, void 0, function () {
        var gitCommands, options, gfSettings, _a, packageFile, releaseMessage, _b, observatoryTasks, files, _i, files_1, file, _c, _d, command, _e, _f, command, files, _g, _h, command, err_1;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 8, , 9]);
                    options = new Options_1.Options(args);
                    if (options.showHelp) {
                        throw new HelpError_1.HelpError();
                    }
                    gfSettings = gitFlowSettings_1.gitFlowSettings(path_1.resolve("./"));
                    GitCommands_1.GitCommands.checkForCleanWorkingDirectory();
                    if (!(!options.nextVersion && !options.releaseType)) return [3 /*break*/, 2];
                    _a = options;
                    return [4 /*yield*/, askReleaseType_1.askReleaseType()];
                case 1:
                    _a.releaseType = _j.sent();
                    _j.label = 2;
                case 2:
                    packageFile = new PackageFile_1.PackageFile(options.packageFileLocation);
                    packageFile.load();
                    if (!options.currentVersion) {
                        options.currentVersion = packageFile.getVersion();
                    }
                    if (!options.nextVersion) {
                        options.nextVersion = incrementVersion_1.incrementVersion(options.currentVersion, options.releaseType);
                    }
                    releaseMessage = void 0;
                    if (!(options.releaseMessage === true)) return [3 /*break*/, 4];
                    return [4 /*yield*/, askReleaseMessage_1.askReleaseMessage(options.nextVersion)];
                case 3:
                    releaseMessage = _j.sent();
                    return [3 /*break*/, 5];
                case 4:
                    releaseMessage = options.releaseMessage.replace("{version}", options.nextVersion);
                    _j.label = 5;
                case 5:
                    _b = !options.noConfirm;
                    if (!_b) return [3 /*break*/, 7];
                    return [4 /*yield*/, askConfirmUpdate_1.askConfirmUpdate(options.currentVersion, options.nextVersion)];
                case 6:
                    _b = !(_j.sent());
                    _j.label = 7;
                case 7:
                    if (_b) {
                        throw new Error("Update Canceled");
                    }
                    observatoryTasks = void 0;
                    if (!options.quiet) {
                        observatoryTasks = {
                            git_pull: Observatory.add("GIT: Pull from Origin"),
                            git_start: Observatory.add("GIT: Start Release"),
                            write_files: Observatory.add("Files: Write New Version"),
                            pre_commit_commands: Observatory.add("Commands: Pre Commit"),
                            git_commit: Observatory.add("GIT: Commit Files"),
                            post_commit_commands: Observatory.add("Commands: Post Commit"),
                            git_finish: Observatory.add("GIT: Finish Release"),
                            git_push: Observatory.add("GIT: Push to Origin"),
                            post_complete_commands: Observatory.add("Commands: Post Complete"),
                        };
                    }
                    gitCommands = new GitCommands_1.GitCommands({
                        masterBranch: gfSettings.master,
                        developBranch: gfSettings.develop,
                        currentVersion: options.currentVersion,
                        nextVersion: options.nextVersion,
                        releaseMessage: releaseMessage,
                        remote: options.remote,
                        skipGitFlowFinish: options.skipGitFlowFinish,
                    });
                    if (!options.skipGitPull) {
                        if (!options.quiet) {
                            observatoryTasks.git_pull.status("Pulling");
                        }
                        gitCommands.pull();
                        if (!options.quiet) {
                            observatoryTasks.git_pull.done("Complete");
                        }
                    }
                    else {
                        if (!options.quiet) {
                            observatoryTasks.git_pull.done("Skipped");
                        }
                    }
                    if (!options.quiet) {
                        observatoryTasks.git_start.status("Starting");
                    }
                    gitCommands.start();
                    if (!options.quiet) {
                        observatoryTasks.git_start.done("Complete");
                    }
                    try {
                        files = globNormalize_1.globNormalize(options.filesToVersion);
                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                            file = files_1[_i];
                            if (!options.quiet) {
                                observatoryTasks.write_files.status(file);
                            }
                            replaceVersionInFile_1.replaceVersionInFile(file, options.currentVersion, options.nextVersion);
                        }
                    }
                    catch (e) {
                        throw new GitResetError_1.GitResetError(e);
                    }
                    if (!options.quiet) {
                        observatoryTasks.write_files.status(options.packageFileLocation);
                    }
                    packageFile.setVersion(options.nextVersion);
                    packageFile.save();
                    if (!options.quiet) {
                        observatoryTasks.write_files.done("Complete");
                    }
                    try {
                        if (!options.quiet) {
                            observatoryTasks.pre_commit_commands.status("Running");
                        }
                        for (_c = 0, _d = options.preCommitCommands; _c < _d.length; _c++) {
                            command = _d[_c];
                            if (!options.quiet) {
                                observatoryTasks.pre_commit_commands.status(command);
                            }
                            runArbitraryCommand_1.runArbitraryCommand(command);
                        }
                        if (!options.quiet) {
                            observatoryTasks.pre_commit_commands.done("Completed");
                        }
                    }
                    catch (e) {
                        throw new GitResetError_1.GitResetError(e);
                    }
                    try {
                        if (!options.quiet) {
                            observatoryTasks.post_commit_commands.status("Running");
                        }
                        for (_e = 0, _f = options.postCommitCommands; _e < _f.length; _e++) {
                            command = _f[_e];
                            if (!options.quiet) {
                                observatoryTasks.post_commit_commands.status(command);
                            }
                            runArbitraryCommand_1.runArbitraryCommand(command);
                        }
                        if (!options.quiet) {
                            observatoryTasks.post_commit_commands.done("Completed");
                        }
                    }
                    catch (e) {
                        throw new GitResetError_1.GitResetError(e);
                    }
                    try {
                        if (!options.quiet) {
                            observatoryTasks.git_commit.status("Committing");
                        }
                        files = globNormalize_1.globNormalize(options.packageFileLocation, options.filesToCommit, options.filesToVersion);
                        gitCommands.commit(files);
                        if (!options.quiet) {
                            observatoryTasks.git_commit.done("Completed");
                        }
                    }
                    catch (e) {
                        throw new GitResetError_1.GitResetError(e);
                    }
                    if (!options.skipGitFlowFinish) {
                        if (!options.quiet) {
                            observatoryTasks.git_finish.status("Finishing");
                        }
                        try {
                            gitCommands.finish();
                        }
                        catch (e) {
                            throw new GitResetError_1.GitResetError(e);
                        }
                        if (!options.quiet) {
                            observatoryTasks.git_finish.done("Complete");
                        }
                    }
                    else {
                        if (!options.quiet) {
                            observatoryTasks.git_finish.done("Skipped");
                        }
                    }
                    if (!options.skipGitPush) {
                        if (!options.quiet) {
                            observatoryTasks.git_push.status("Pushing");
                        }
                        gitCommands.push();
                        if (!options.quiet) {
                            observatoryTasks.git_push.done("Complete");
                        }
                    }
                    else {
                        if (!options.quiet) {
                            observatoryTasks.git_push.done("Skipped");
                        }
                    }
                    try {
                        if (!options.quiet) {
                            observatoryTasks.post_complete_commands.status("Running");
                        }
                        for (_g = 0, _h = options.postCompleteCommands; _g < _h.length; _g++) {
                            command = _h[_g];
                            if (!options.quiet) {
                                observatoryTasks.post_complete_commands.status(command);
                            }
                            runArbitraryCommand_1.runArbitraryCommand(command);
                        }
                        if (!options.quiet) {
                            observatoryTasks.post_complete_commands.done("Completed");
                        }
                    }
                    catch (e) {
                        throw new GitResetError_1.GitResetError(e);
                    }
                    process.exit(0);
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _j.sent();
                    if (IS_DEBUG) {
                        throw err_1;
                    }
                    if (err_1 instanceof GitResetError_1.GitResetError) {
                        gitCommands.reset();
                        console.error(err_1.message);
                        process.exit(1);
                    }
                    else if (err_1 instanceof HelpError_1.HelpError) {
                        console.log(err_1.message);
                        process.exit(0);
                    }
                    else if (err_1 instanceof UncleanWorkingDirectoryError_1.UncleanWorkingDirectoryError) {
                        console.log(err_1.message);
                        process.exit(1);
                    }
                    else {
                        console.error("There was an unknown error.");
                        process.exit(1);
                    }
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.main = main;
