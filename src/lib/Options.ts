/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import * as Minimist from "minimist";
import {resolve} from "path";
import * as extend from "xtend";
import {existsSync} from "fs";

interface IOptionDef {
    "default": any;
    file_key: false | string;
    filter?: (input: any) => any;
    switches: false | string[];
    validate: (input: any) => boolean;
}

const options: {[key: string]: IOptionDef} = {
    showHelp: {
        default: false,
        switches: ["h", "help"],
        file_key: false,
        validate: (input: any) => typeof input === "boolean",
    },
    quiet: {
        default: false,
        switches: ["q", "quiet"],
        file_key: false,
        validate: (input: any) => typeof input === "boolean",
    },
    packageFileLocation: {
        default: "./package.json",
        switches: ["p", "package"],
        file_key: "package_file_location",
        filter: (input: any) => resolve(input),
        validate: (input: any) => typeof input === "string" && existsSync(input),
    },
    dotReleaseFileLocation: {
        default: "./.release.json",
        switches: ["d", "release-file"],
        file_key: false,
        filter: (input: any) => resolve(input),
        validate: (input: any) => typeof input === "string",
    },
    noConfirm: {
        default: false,
        switches: ["n", "no-confirm"],
        file_key: "no_confirm",
        validate: (input: any) => typeof input === "boolean",
    },
    releaseType: {
        default: null as string,
        switches: ["t", "release-type"],
        file_key: "release_type",
        validate: (input: any) => input === null || (typeof input === "string" && (input === "patch" || input === "minor" || input === "major")),
    },
    currentVersion: {
        default: null as string,
        switches: ["c", "current-version"],
        file_key: false,
        validate: (input: any) => input === null || typeof input === "string",
    },
    nextVersion: {
        default: null as string,
        switches: ["v", "next-version"],
        file_key: false,
        validate: (input: any) => input === null || typeof input === "string",
    },
    remote: {
        default: "origin",
        switches: ["o", "remote"],
        file_key: "remote",
        validate: (input: any) => typeof input === "string",
    },
    skipGitPull: {
        default: false,
        switches: ["l", "skip-git-pull"],
        file_key: "skip_git_pull",
        validate: (input: any) => typeof input === "boolean",
    },
    skipGitPush: {
        default: false,
        switches: ["s", "skip-git-push"],
        file_key: "skip_git_push",
        validate: (input: any) => typeof input === "boolean",
    },
    skipGitFlowFinish: {
        default: false,
        switches: ["f", "skip-git-flow-finish"],
        file_key: "skip_git_flow_finish",
        validate: (input: any) => typeof input === "boolean",
    },
    releaseMessage: {
        default: "Release {version}",
        switches: ["m", "set-release-message"],
        file_key: "release_message",
        filter: (input: any) => {
            if (input === false) {
                return "Release {version}";
            } else {
                return input;
            }
        },
        validate: (input: any) => input === true || typeof input === "string",
    },
    preCommitCommands: {
        default: [] as string[],
        switches: false,
        file_key: "pre_commit_commands",
        validate: (input: any) => Array.isArray(input),
    },
    postCommitCommands: {
        default: [] as string[],
        switches: false,
        file_key: "post_commit_commands",
        validate: (input: any) => Array.isArray(input),
    },
    postCompleteCommands: {
        default: [] as string[],
        switches: false,
        file_key: "post_complete_commands",
        validate: (input: any) => Array.isArray(input),
    },
    filesToVersion: {
        default: ["README.md"],
        switches: false,
        file_key: "files_to_version",
        validate: (input: any) => Array.isArray(input),
    },
    filesToCommit: {
        default: [] as string[],
        switches: false,
        file_key: "files_to_commit",
        validate: (input: any) => Array.isArray(input),
    },
};

export class Options {
    private fileData: any = {};

    public args: Minimist.ParsedArgs;
    public showHelp: boolean;
    public quiet: boolean;
    public packageFileLocation: string;
    public dotReleaseFileLocation: string;
    public noConfirm: boolean;
    public releaseType: "patch" | "minor" | "major";
    public currentVersion: string;
    public nextVersion: string;
    public remote: string;
    public skipGitPull: boolean;
    public skipGitPush: boolean;
    public skipGitFlowFinish: boolean;
    public releaseMessage: string | true;
    public preCommitCommands: string[];
    public postCommitCommands: string[];
    public postCompleteCommands: string[];
    public filesToVersion: string[];
    public filesToCommit: string[];

    constructor(args: any []) {
        this.args = Minimist(args.slice(2));

        this.getOption("dotReleaseFileLocation", options.dotReleaseFileLocation);
        this.getOption("packageFileLocation", options.packageFileLocation);

        this.loadPackageConfig();
        this.loadFileData();
        this.getAllOptions();
    }

    public getOption(key: keyof this, opts: IOptionDef) {
        let value: any;

        if (opts.switches) { value = this.getSwitchValue(opts.switches); }
        if (value === undefined && opts.file_key !== false) { value = this.getFileValue(opts.file_key); }
        if (value === undefined) { value = opts.default; }
        if (opts.filter) { value = opts.filter(value); }

        if (opts.validate && !opts.validate(value)) {
            throw new Error(`Invalid Value for ${key}: ${value}`);
        }

        this[key] = value;
    }

    public getAllOptions() {
        for (const key in options) {
            if (options.hasOwnProperty(key)) {
                this.getOption(key as keyof this, options[key]);
            }
        }
    }

    public getSwitchValue(switches: string[]) {
        for (const s of switches) {
            if (this.args[s]) {
                return this.args[s];
            }
        }
    }

    public getFileValue(fileKey: string) {
        if (this.fileData[fileKey]) {
            return this.fileData[fileKey];
        }
    }

    public loadFileData() {
        if (existsSync(this.dotReleaseFileLocation)) {
            this.fileData = extend(this.fileData, require(this.dotReleaseFileLocation));
        }
    }

    public loadPackageConfig() {
        if (existsSync(this.packageFileLocation)) {
            const packageJson = require(this.packageFileLocation);
            if (packageJson.config && packageJson.config.generateRelease) {
                this.fileData = extend(this.fileData, packageJson.config.generateRelease);
            }
        }
    }
}
