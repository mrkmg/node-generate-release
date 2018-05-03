/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

require("es6-shim");

import {UncleanWorkingDirectoryError} from "./lib/error/UncleanWorkingDirectoryError";
import {resolve} from "path";

import {GitCommands} from "./lib/GitCommands";
import {Options} from "./lib/Options";
import {PackageFile} from "./lib/PackageFile";

import {GitResetError} from "./lib/error/GitResetError";
import {HelpError} from "./lib/error/HelpError";

import {askConfirmUpdate} from "./lib/question/askConfirmUpdate";
import {askReleaseMessage} from "./lib/question/askReleaseMessage";
import {askReleaseType} from "./lib/question/askReleaseType";

import {gitFlowSettings} from "./lib/helper/gitFlowSettings";
import {globNormalize} from "./lib/helper/globNormalize";
import {incrementVersion} from "./lib/helper/incrementVersion";
import {replaceVersionInFile} from "./lib/helper/replaceVersionInFile";
import {runArbitraryCommand} from "./lib/helper/runArbitraryCommand";

import * as Observatory from "observatory";


const IS_DEBUG = !!process.env.IS_DEBUG;

export async function main(args: string[]) {
    let gitCommands: GitCommands;

    try {
        const options = new Options(args);
        if (options.showHelp) {
            throw new HelpError();
        }

        const gfSettings = gitFlowSettings(resolve("./"));

        GitCommands.checkForCleanWorkingDirectory();

        if (!options.nextVersion && !options.releaseType) {
            options.releaseType = await askReleaseType();
        }

        const packageFile = new PackageFile(options.packageFileLocation);
        packageFile.load();

        if (!options.currentVersion) {
            options.currentVersion = packageFile.getVersion();
        }

        if (!options.nextVersion) {
            options.nextVersion = incrementVersion(options.currentVersion, options.releaseType);
        }

        let releaseMessage: string;
        if (options.releaseMessage === true) {
            releaseMessage = await askReleaseMessage(options.nextVersion);
        } else {
            releaseMessage = options.releaseMessage.replace("{version}", options.nextVersion);
        }

        if (!options.noConfirm && !(await askConfirmUpdate(options.currentVersion, options.nextVersion))) {
            throw new Error("Update Canceled");
        }

        let observatoryTasks: any;

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

        gitCommands = new GitCommands({
            masterBranch: gfSettings.master,
            developBranch: gfSettings.develop,
            currentVersion: options.currentVersion,
            nextVersion: options.nextVersion,
            releaseMessage,
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
        } else {
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
            const files = globNormalize(options.filesToVersion);
            for (const file of files) {
                if (!options.quiet) {
                    observatoryTasks.write_files.status(file);
                }
                replaceVersionInFile(file, options.currentVersion, options.nextVersion);
            }
        } catch (e) {
            throw new GitResetError(e);
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
            for (const command of options.preCommitCommands) {
                if (!options.quiet) {
                    observatoryTasks.pre_commit_commands.status(command);
                }
                runArbitraryCommand(command);
            }
            if (!options.quiet) {
                observatoryTasks.pre_commit_commands.done("Completed");
            }
        } catch (e) {
            throw new GitResetError(e);
        }

        try {
            if (!options.quiet) {
                observatoryTasks.post_commit_commands.status("Running");
            }
            for (const command of options.postCommitCommands) {
                if (!options.quiet) {
                    observatoryTasks.post_commit_commands.status(command);
                }
                runArbitraryCommand(command);
            }
            if (!options.quiet) {
                observatoryTasks.post_commit_commands.done("Completed");
            }
        } catch (e) {
            throw new GitResetError(e);
        }

        try {
            if (!options.quiet) {
                observatoryTasks.git_commit.status("Committing");
            }
            const files = globNormalize(options.packageFileLocation, options.filesToCommit, options.filesToVersion);
            gitCommands.commit(files);
            if (!options.quiet) {
                observatoryTasks.git_commit.done("Completed");
            }
        } catch (e) {
            throw new GitResetError(e);
        }

        if (!options.skipGitFlowFinish) {
            if (!options.quiet) {
                observatoryTasks.git_finish.status("Finishing");
            }
            try {
                gitCommands.finish();
            } catch (e) {
                throw new GitResetError(e);
            }
            if (!options.quiet) {
                observatoryTasks.git_finish.done("Complete");
            }
        } else {
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
        } else {
            if (!options.quiet) {
                observatoryTasks.git_push.done("Skipped");
            }
        }

        try {
            if (!options.quiet) {
                observatoryTasks.post_complete_commands.status("Running");
            }
            for (const command of options.postCompleteCommands) {
                if (!options.quiet) {
                    observatoryTasks.post_complete_commands.status(command);
                }
                runArbitraryCommand(command);
            }
            if (!options.quiet) {
                observatoryTasks.post_complete_commands.done("Completed");
            }
        } catch (e) {
            throw new GitResetError(e);
        }

        process.exit(0);
    } catch (err) {
        if (IS_DEBUG) {
            throw err;
        }
        if (err instanceof GitResetError) {
            gitCommands.reset();
            console.error(err.message);
            process.exit(1);
        } else if (err instanceof HelpError) {
            console.log(err.message);
            process.exit(0);
        } else if (err instanceof UncleanWorkingDirectoryError) {
            console.log(err.message);
            process.exit(1);
        } else {
            console.error("There was an unknown error.");
            process.exit(1);
        }
    }
}
