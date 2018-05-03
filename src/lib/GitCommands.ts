/**
 * Generate Release
 * Kevin Gravier
 * MIT License
 */

import {execSync, spawnSync} from "child_process";
import {unlinkSync, writeFileSync} from "fs";
import {path} from "temp";
import {UncleanWorkingDirectoryError} from "./error/UncleanWorkingDirectoryError";

const env = process.env;
env.GIT_MERGE_AUTOEDIT = "no";

const AVH_EDITION_REGEX = /AVH Edition/;

export class GitCommands {
    public masterBranch = "master";
    public developBranch = "develop";
    public remote: string;
    public releaseBranch: string;
    public currentVersion: string;
    public nextVersion: string;
    public releaseMessage: string;
    public skipGitFlowFinish: boolean = false;
    public isAvh: boolean = false;

    constructor(opts: any) {
        this.releaseMessage = `release/${this.nextVersion}`;

        if (opts.masterBranch) { this.masterBranch = opts.masterBranch; }
        if (opts.developBranch) { this.developBranch = opts.developBranch; }
        if (opts.currentVersion) { this.currentVersion = opts.currentVersion; }
        if (opts.nextVersion) { this.nextVersion = opts.nextVersion; }
        if (opts.releaseMessage) { this.releaseMessage = opts.releaseMessage; }
        if (opts.skipGitFlowFinish) { this.skipGitFlowFinish = opts.skipGitFlowFinish; }
        if (opts.remote) { this.remote = opts.remote; }

        this.isAvh = GitCommands.isAvhEdition();

        if (!opts.currentVersion) { throw new Error("Current Version is not set."); }
        if (!opts.nextVersion) { throw new Error("Next Version is not set."); }
    }

    public static isAvhEdition() {
        const versionResult = execSync("git flow version", {env});
        return AVH_EDITION_REGEX.test(versionResult.toString());
    }

    public static checkForCleanWorkingDirectory() {
        try {
            execSync("git diff-index --quiet HEAD --", {env});
        } catch (e) {
            throw new UncleanWorkingDirectoryError();
        }
    }

    public static git(...args: string[]) {
        const result = spawnSync("git", args, {env, stdio: "pipe"});

        if (result.status !== 0) {
            throw new Error(`git ${args.join(" ")} returned ${result.status}. \n\n Output: \n\n ${result.stderr}`);
        }

        return result.stdout ? result.stdout.toString() : "";
    }

    public static addDeletedFiles() {
        const files = GitCommands.git("ls-files", "--deleted").split("\n");
        for (const file of files) {
            if (file !== "") {
                GitCommands.git("rm", "--cached", file);
            }
        }
    }

    public pull() {
        GitCommands.git("fetch", this.remote);
        GitCommands.git("checkout", this.developBranch);
        GitCommands.git("pull", this.remote, this.developBranch, "--rebase");
        GitCommands.git("checkout", this.masterBranch);
        GitCommands.git("reset", "--hard", `${this.remote}/${this.masterBranch}`);
    }

    public push() {
        if (this.skipGitFlowFinish) {
            GitCommands.git("push", "-u", this.remote, this.releaseBranch);
        } else {
            GitCommands.git("push", this.remote, this.developBranch);
            GitCommands.git("push", this.remote, this.masterBranch);
            GitCommands.git("push", this.remote, "--tags");
        }
    }

    public reset() {
        GitCommands.git("checkout", this.developBranch);
        GitCommands.git("reset", "--hard", "HEAD");
        GitCommands.git("branch", "-D", `release/${this.nextVersion}`);
    }

    public start() {
        GitCommands.git("checkout", this.developBranch);
        GitCommands.git("flow", "release", "start", this.nextVersion);
    }

    public commit(files: string[]) {
        GitCommands.addDeletedFiles();
        for (const file of files) { GitCommands.git("add", file); }
        GitCommands.git("commit", "-m", this.releaseMessage);
    }

    public finish() {
        this.isAvh ? this.finishAvh() : this.finishNonAvh();
    }

    public finishNonAvh() {
        GitCommands.git("flow", "release", "finish", "-m", this.releaseMessage, this.nextVersion);
    }

    public finishAvh() {
        const releaseMessageFile = path();
        writeFileSync(releaseMessageFile, this.releaseMessage);
        try {
            GitCommands.git("flow", "release", "finish", "-f", releaseMessageFile, this.nextVersion);
        } finally {
            unlinkSync(releaseMessageFile);
        }
    }
}
