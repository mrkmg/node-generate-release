/**
 * Generate Release
 * Kevin Gravier
 * MIT License
 */

import {execSync, spawnSync} from "child_process";
import {readFileSync, unlinkSync, writeFileSync} from "fs";
import {path as tempPath} from "temp";
import {UncleanWorkingDirectoryError} from "./error/UncleanWorkingDirectoryError";
import {gitFlowSettings} from "./helper/gitFlowSettings";
import {gitStreamSettings} from "./helper/gitStreamSettings";

const env = process.env;
env.GIT_MERGE_AUTOEDIT = "no";

const AVH_EDITION_REGEX = /AVH Edition/;

enum RepoType {
    GitFlow,
    GitStream,
}

export class GitCommands {
    public static getRepoType(): RepoType {
        const gitConfigData = readFileSync("./.git/config").toString();
        if (/\[gitstream/.test(gitConfigData)) { return RepoType.GitStream; }
        if (/\[gitflow/.test(gitConfigData)) { return RepoType.GitFlow; }
        throw new Error("Unknown Git Plugin");
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

    public currentVersion: string;
    public developBranch: string;
    public repoType: RepoType;
    public isAvh: boolean = false;
    public masterBranch: string;
    public nextVersion: string;
    public releaseBranch: string;
    public releaseMessage: string;
    public remote: string;
    public skipFinish: boolean = false;

    constructor(opts: Partial<GitCommands>) {
        this.releaseMessage = `release/${this.nextVersion}`;

        if (opts.currentVersion) { this.currentVersion = opts.currentVersion; }
        if (opts.nextVersion) { this.nextVersion = opts.nextVersion; }
        if (opts.releaseMessage) { this.releaseMessage = opts.releaseMessage; }
        if (opts.remote) { this.remote = opts.remote; }
        if (opts.skipFinish) { this.skipFinish = opts.skipFinish; }

        this.repoType = GitCommands.getRepoType();

        switch (this.repoType) {
            case RepoType.GitFlow:
                const gfSettings = gitFlowSettings();
                this.masterBranch = gfSettings.master;
                this.developBranch = gfSettings.develop;
                this.isAvh = GitCommands.isAvhEdition();
                break;
            case RepoType.GitStream:
                const gsSettings = gitStreamSettings();
                this.developBranch = gsSettings.develop;
        }

        if (!opts.currentVersion) { throw new Error("Current Version is not set."); }
        if (!opts.nextVersion) { throw new Error("Next Version is not set."); }
    }

    public pull() {
        GitCommands.git("fetch", this.remote);
        GitCommands.git("checkout", this.developBranch);
        GitCommands.git("pull", this.remote, this.developBranch, "--rebase");
        if (this.repoType === RepoType.GitFlow) {
            GitCommands.git("checkout", this.masterBranch);
            GitCommands.git("reset", "--hard", `${this.remote}/${this.masterBranch}`);
        }
    }

    public push() {
        if (this.skipFinish) {
            GitCommands.git("push", "-u", this.remote, this.releaseBranch);
        } else {
            GitCommands.git("push", this.remote, this.developBranch);

            if (this.repoType === RepoType.GitFlow) {
                GitCommands.git("push", this.remote, this.masterBranch);
            }

            GitCommands.git("push", this.remote, "--tags");
        }
    }

    public reset() {
        GitCommands.git("checkout", this.developBranch);
        GitCommands.git("reset", "--hard", "HEAD");
        try {
            GitCommands.git("branch", "-D", `release/${this.nextVersion}`);
        } catch (e) {
            // It is safe to throw this away in case the next release branch was not yet made
        }
    }

    public start() {
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
    }

    public commit(files: string[]) {
        GitCommands.addDeletedFiles();
        for (const file of files) { GitCommands.git("add", file); }
        GitCommands.git("commit", "-m", this.releaseMessage);
    }

    public finish() {
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
    }

    private finishGitFlowAvh() {
        const releaseMessageFile = tempPath();
        writeFileSync(releaseMessageFile, this.releaseMessage);
        try {
            GitCommands.git("flow", "release", "finish", "-f", releaseMessageFile, this.nextVersion);
        } finally {
            unlinkSync(releaseMessageFile);
        }
    }
}
