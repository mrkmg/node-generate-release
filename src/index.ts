/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
import {ReleaseCanceledError} from "./lib/error/ReleaseCanceledError";

// tslint:disable-next-line
require("es6-shim");

import * as Observatory from "observatory";
import {IObservatoryTask} from "observatory";
import {resolve} from "path";
import {UncleanWorkingDirectoryError} from "./lib/error/UncleanWorkingDirectoryError";

import {GitCommands} from "./lib/GitCommands";
import {Options} from "./lib/Options";
import {PackageFile} from "./lib/PackageFile";

import {GitResetError} from "./lib/error/GitResetError";
import {HelpError} from "./lib/error/HelpError";

import {askConfirmUpdate} from "./lib/question/askConfirmUpdate";
import {askReleaseMessage} from "./lib/question/askReleaseMessage";
import {askReleaseType} from "./lib/question/askReleaseType";

import {gitFlowSettings, IGitFlowSettings} from "./lib/helper/gitFlowSettings";
import {globNormalize} from "./lib/helper/globNormalize";
import {incrementVersion} from "./lib/helper/incrementVersion";
import {replaceVersionInFile} from "./lib/helper/replaceVersionInFile";
import {runArbitraryCommand} from "./lib/helper/runArbitraryCommand";

const IS_DEBUG = !!process.env.IS_DEBUG;

export function main(args: string[]) {
    const m = new Main(args);
    return m.run();
}

interface IObservatoryTasks {
    git_pull: IObservatoryTask;
    git_start: IObservatoryTask;
    write_files: IObservatoryTask;
    pre_commit_commands: IObservatoryTask;
    git_commit: IObservatoryTask;
    post_commit_commands: IObservatoryTask;
    git_finish: IObservatoryTask;
    git_push: IObservatoryTask;
    post_complete_commands: IObservatoryTask;
}

class Main {
    private gitCommands: GitCommands;
    private gitFlowSettings: IGitFlowSettings;
    private observatoryTasks: IObservatoryTasks;
    private options: Options;
    private packageFile: PackageFile;
    private releaseMessage: string;

    constructor(private args: string[]) {
    }

    public async run() {
        try {
            await this.runReal();
            process.exit(0);
        } catch (err) {
            if (IS_DEBUG) {
                throw err;
            }
            if (err instanceof GitResetError) {
                this.gitCommands.reset();
                console.error(err.message);
                process.exit(1);
            } else if (err instanceof HelpError || err instanceof ReleaseCanceledError) {
                console.log(err.message);
                process.exit(0);
            } else if (
                err instanceof UncleanWorkingDirectoryError) {
                console.log(err.message);
                process.exit(1);
            } else {
                console.error("There was an unknown error.");
                console.error(err.message);
                process.exit(1);
            }
        }
    }

    private async runReal() {
        await this.loadOptions();
        this.loadGitFlowSettings();
        GitCommands.checkForCleanWorkingDirectory();
        this.loadPackageFile();
        await this.setReleaseMessage();
        await this.confirmRelease();
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
        } catch (err) {
            throw new GitResetError(err);
        }

        this.runGitPush();
        this.postCompleteCommands();
    }

    private observatoryStatus(task: keyof IObservatoryTasks, status: string) {
        if (this.options.quiet) {
            return;
        }

        this.observatoryTasks[task].status(status);
    }

    private observatoryDone(task: keyof IObservatoryTasks, status: string) {
        if (this.options.quiet) {
            return;
        }

        this.observatoryTasks[task].done(status);
    }

    private async loadOptions() {
        this.options = new Options(this.args);

        if (this.options.showHelp) {
            throw new HelpError();
        }

        if (!this.options.nextVersion && !this.options.releaseType) {
            this.options.releaseType = await askReleaseType();
        }
    }

    private loadGitFlowSettings() {
        this.gitFlowSettings = gitFlowSettings(resolve("./"));
    }

    private loadPackageFile() {
        this.packageFile = new PackageFile(this.options.packageFileLocation);
        this.packageFile.load();

        if (!this.options.currentVersion) {
            this.options.currentVersion = this.packageFile.getVersion();
        }

        if (!this.options.nextVersion) {
            this.options.nextVersion = incrementVersion(this.options.currentVersion, this.options.releaseType);
        }
    }

    private async setReleaseMessage() {
        if (this.options.releaseMessage === true) {
            this.releaseMessage = await askReleaseMessage(this.options.nextVersion);
        } else {
            this.releaseMessage = this.options.releaseMessage.replace("{version}", this.options.nextVersion);
        }
    }

    private async confirmRelease() {
        if (this.options.noConfirm) {
            return;
        }

        const doRelease = await askConfirmUpdate(this.options.currentVersion, this.options.nextVersion);

        if (!doRelease) {
            throw new ReleaseCanceledError();
        }
    }

    private setupObservatory() {
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
    }

    private setupGitCommands() {
        this.gitCommands = new GitCommands({
            currentVersion: this.options.currentVersion,
            developBranch: this.gitFlowSettings.develop,
            masterBranch: this.gitFlowSettings.master,
            nextVersion: this.options.nextVersion,
            releaseMessage: this.releaseMessage,
            remote: this.options.remote,
            skipGitFlowFinish: this.options.skipGitFlowFinish,
        });
    }

    private runGitPull() {
        if (this.options.skipGitPull) {
            this.observatoryDone("git_pull", "Skip");
            return;
        }

        this.observatoryStatus("git_pull", "Pulling");
        this.gitCommands.pull();
        this.observatoryDone("git_pull", "Complete");
    }

    private runGitStart() {
        this.observatoryStatus("git_start", "Starting");
        this.gitCommands.start();
        this.observatoryDone("git_start", "Complete");
    }

    private versionFiles() {
        this.observatoryStatus("write_files", "Starting");
        const files = globNormalize(this.options.filesToVersion);
        for (const file of files) {
            this.observatoryStatus("write_files", file);
            replaceVersionInFile(file, this.options.currentVersion, this.options.nextVersion);
        }

        this.observatoryStatus("write_files", this.options.packageFileLocation);
        this.packageFile.setVersion(this.options.nextVersion);
        this.packageFile.save();

        this.observatoryDone("write_files", "Complete");
    }

    private preCommitCommands() {
        this.observatoryStatus("pre_commit_commands", "Running");
        for (const command of this.options.preCommitCommands) {
            this.observatoryStatus("pre_commit_commands", command);
            runArbitraryCommand(command);
        }
        this.observatoryDone("pre_commit_commands", "Complete");
    }

    private runGitCommit() {
        this.observatoryStatus("git_commit", "Running");
        const files = globNormalize(this.options.packageFileLocation,
            this.options.filesToCommit,
            this.options.filesToVersion);
        this.gitCommands.commit(files);
        this.observatoryDone("git_commit", "Complete");
    }

    private postCommitCommands() {
        this.observatoryStatus("post_commit_commands", "Running");
        for (const command of this.options.postCommitCommands) {
            this.observatoryStatus("post_commit_commands", command);
            runArbitraryCommand(command);
        }
        this.observatoryDone("post_commit_commands", "Complete");
    }

    private runGitFinish() {
        if (this.options.skipGitFlowFinish) {
            this.observatoryDone("git_finish", "Skip");
            return;
        }

        this.observatoryStatus("git_finish", "Finishing");
        this.gitCommands.finish();
        this.observatoryDone("git_finish", "Complete");

    }

    private runGitPush() {
        if (this.options.skipGitPush) {
            this.observatoryDone("git_push", "Skip");
            return;
        }

        this.observatoryStatus("git_push", "Pushing");
        this.gitCommands.push();
        this.observatoryDone("git_push", "Complete");
    }

    private postCompleteCommands() {
        this.observatoryStatus("post_complete_commands", "Running");
        for (const command of this.options.postCompleteCommands) {
            this.observatoryStatus("post_complete_commands", command);
            runArbitraryCommand(command);
        }
        this.observatoryDone("post_complete_commands", "Complete");
    }
}
