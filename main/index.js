"use strict";
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
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
var ReleaseCanceledError_1 = require("./lib/error/ReleaseCanceledError");
// tslint:disable-next-line
require("es6-shim");
var Observatory = require("observatory");
var UncleanWorkingDirectoryError_1 = require("./lib/error/UncleanWorkingDirectoryError");
var GitCommands_1 = require("./lib/GitCommands");
var Options_1 = require("./lib/Options");
var PackageFile_1 = require("./lib/PackageFile");
var GitResetError_1 = require("./lib/error/GitResetError");
var HelpError_1 = require("./lib/error/HelpError");
var askConfirmUpdate_1 = require("./lib/question/askConfirmUpdate");
var askReleaseMessage_1 = require("./lib/question/askReleaseMessage");
var askReleaseType_1 = require("./lib/question/askReleaseType");
var globNormalize_1 = require("./lib/helper/globNormalize");
var incrementVersion_1 = require("./lib/helper/incrementVersion");
var replaceVersionInFile_1 = require("./lib/helper/replaceVersionInFile");
var runArbitraryCommand_1 = require("./lib/helper/runArbitraryCommand");
var IS_DEBUG = !!process.env.IS_DEBUG;
function main(args) {
    var m = new Main(args);
    return m.run();
}
exports.main = main;
var Main = /** @class */ (function () {
    function Main(args) {
        this.args = args;
    }
    Main.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.runReal()];
                    case 1:
                        _a.sent();
                        process.exit(0);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        if (IS_DEBUG) {
                            throw err_1;
                        }
                        if (err_1 instanceof GitResetError_1.GitResetError) {
                            this.gitCommands.reset();
                            console.error(err_1.message);
                            process.exit(1);
                        }
                        else if (err_1 instanceof HelpError_1.HelpError || err_1 instanceof ReleaseCanceledError_1.ReleaseCanceledError) {
                            console.log(err_1.message);
                            process.exit(0);
                        }
                        else if (err_1 instanceof UncleanWorkingDirectoryError_1.UncleanWorkingDirectoryError) {
                            console.log(err_1.message);
                            process.exit(1);
                        }
                        else {
                            console.error("There was an unknown error.");
                            console.error(err_1.message);
                            process.exit(1);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.runReal = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadOptions()];
                    case 1:
                        _a.sent();
                        GitCommands_1.GitCommands.checkForCleanWorkingDirectory();
                        this.loadPackageFile();
                        return [4 /*yield*/, this.setReleaseMessage()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.confirmRelease()];
                    case 3:
                        _a.sent();
                        this.setupObservatory();
                        this.setupGitCommands();
                        this.runGitPull();
                        this.runGitStart();
                        try {
                            this.versionFiles();
                            this.preCommitCommands();
                            this.runGitCommit();
                            this.postCommitCommands();
                            this.runGitFinish();
                        }
                        catch (err) {
                            throw new GitResetError_1.GitResetError(err);
                        }
                        this.runGitPush();
                        this.postCompleteCommands();
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.observatoryStatus = function (task, status) {
        if (this.options.quiet) {
            return;
        }
        this.observatoryTasks[task].status(status);
    };
    Main.prototype.observatoryDone = function (task, status) {
        if (this.options.quiet) {
            return;
        }
        this.observatoryTasks[task].done(status);
    };
    Main.prototype.loadOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.options = new Options_1.Options(this.args);
                        if (this.options.showHelp) {
                            throw new HelpError_1.HelpError();
                        }
                        if (!(!this.options.nextVersion && !this.options.releaseType)) return [3 /*break*/, 2];
                        _a = this.options;
                        return [4 /*yield*/, askReleaseType_1.askReleaseType()];
                    case 1:
                        _a.releaseType = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.loadPackageFile = function () {
        this.packageFile = new PackageFile_1.PackageFile(this.options.packageFileLocation);
        this.packageFile.load();
        if (!this.options.currentVersion) {
            this.options.currentVersion = this.packageFile.getVersion();
        }
        if (!this.options.nextVersion) {
            this.options.nextVersion = incrementVersion_1.incrementVersion(this.options.currentVersion, this.options.releaseType);
        }
    };
    Main.prototype.setReleaseMessage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.options.releaseMessage === true)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, askReleaseMessage_1.askReleaseMessage(this.options.nextVersion)];
                    case 1:
                        _a.releaseMessage = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.releaseMessage = this.options.releaseMessage.replace("{version}", this.options.nextVersion);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.confirmRelease = function () {
        return __awaiter(this, void 0, void 0, function () {
            var doRelease;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.options.noConfirm) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, askConfirmUpdate_1.askConfirmUpdate(this.options.currentVersion, this.options.nextVersion)];
                    case 1:
                        doRelease = _a.sent();
                        if (!doRelease) {
                            throw new ReleaseCanceledError_1.ReleaseCanceledError();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.setupObservatory = function () {
        if (!this.options.quiet) {
            // tslint:disable:object-literal-sort-keys
            this.observatoryTasks = {
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
            // tslint:enable:object-literal-sort-keys
        }
    };
    Main.prototype.setupGitCommands = function () {
        this.gitCommands = new GitCommands_1.GitCommands({
            currentVersion: this.options.currentVersion,
            nextVersion: this.options.nextVersion,
            releaseMessage: this.releaseMessage,
            remote: this.options.remote,
            skipFinish: this.options.skipFinish,
        });
    };
    Main.prototype.runGitPull = function () {
        if (this.options.skipGitPull) {
            this.observatoryDone("git_pull", "Skip");
            return;
        }
        this.observatoryStatus("git_pull", "Pulling");
        this.gitCommands.pull();
        this.observatoryDone("git_pull", "Complete");
    };
    Main.prototype.runGitStart = function () {
        this.observatoryStatus("git_start", "Starting");
        this.gitCommands.start();
        this.observatoryDone("git_start", "Complete");
    };
    Main.prototype.versionFiles = function () {
        this.observatoryStatus("write_files", "Starting");
        var files = globNormalize_1.globNormalize(this.options.filesToVersion);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            this.observatoryStatus("write_files", file);
            replaceVersionInFile_1.replaceVersionInFile(file, this.options.currentVersion, this.options.nextVersion);
        }
        this.observatoryStatus("write_files", this.options.packageFileLocation);
        this.packageFile.setVersion(this.options.nextVersion);
        this.packageFile.save();
        this.observatoryDone("write_files", "Complete");
    };
    Main.prototype.preCommitCommands = function () {
        this.observatoryStatus("pre_commit_commands", "Running");
        for (var _i = 0, _a = this.options.preCommitCommands; _i < _a.length; _i++) {
            var command = _a[_i];
            this.observatoryStatus("pre_commit_commands", command);
            runArbitraryCommand_1.runArbitraryCommand(command);
        }
        this.observatoryDone("pre_commit_commands", "Complete");
    };
    Main.prototype.runGitCommit = function () {
        this.observatoryStatus("git_commit", "Running");
        var files = globNormalize_1.globNormalize(this.options.packageFileLocation, this.options.filesToCommit, this.options.filesToVersion);
        this.gitCommands.commit(files);
        this.observatoryDone("git_commit", "Complete");
    };
    Main.prototype.postCommitCommands = function () {
        this.observatoryStatus("post_commit_commands", "Running");
        for (var _i = 0, _a = this.options.postCommitCommands; _i < _a.length; _i++) {
            var command = _a[_i];
            this.observatoryStatus("post_commit_commands", command);
            runArbitraryCommand_1.runArbitraryCommand(command);
        }
        this.observatoryDone("post_commit_commands", "Complete");
    };
    Main.prototype.runGitFinish = function () {
        if (this.options.skipFinish) {
            this.observatoryDone("git_finish", "Skip");
            return;
        }
        this.observatoryStatus("git_finish", "Finishing");
        this.gitCommands.finish();
        this.observatoryDone("git_finish", "Complete");
    };
    Main.prototype.runGitPush = function () {
        if (this.options.skipGitPush) {
            this.observatoryDone("git_push", "Skip");
            return;
        }
        this.observatoryStatus("git_push", "Pushing");
        this.gitCommands.push();
        this.observatoryDone("git_push", "Complete");
    };
    Main.prototype.postCompleteCommands = function () {
        this.observatoryStatus("post_complete_commands", "Running");
        for (var _i = 0, _a = this.options.postCompleteCommands; _i < _a.length; _i++) {
            var command = _a[_i];
            this.observatoryStatus("post_complete_commands", command);
            runArbitraryCommand_1.runArbitraryCommand(command);
        }
        this.observatoryDone("post_complete_commands", "Complete");
    };
    return Main;
}());
