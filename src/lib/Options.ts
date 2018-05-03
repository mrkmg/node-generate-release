/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {existsSync} from "fs";
import * as Minimist from "minimist";
import {resolve} from "path";
import * as extend from "xtend";

interface IOptionDef {
    "default": any;
    file_key: false | string;
    filter?: (input: any) => any;
    switches: false | string[];
    validate: (input: any) => boolean;
}

const options: {[key: string]: IOptionDef} = {
    currentVersion: {
        default: null as string,
        file_key: false,
        switches: ["c", "current-version"],
        validate: (input: any) => input === null || typeof input === "string",
    },
    dotReleaseFileLocation: {
        default: "./.release.json",
        file_key: false,
        filter: (input: any) => resolve(input),
        switches: ["d", "release-file"],
        validate: (input: any) => typeof input === "string",
    },
    filesToCommit: {
        default: [] as string[],
        file_key: "files_to_commit",
        switches: false,
        validate: (input: any) => Array.isArray(input),
    },
    filesToVersion: {
        default: ["README.md"],
        file_key: "files_to_version",
        switches: false,
        validate: (input: any) => Array.isArray(input),
    },
    nextVersion: {
        default: null as string,
        file_key: false,
        switches: ["v", "next-version"],
        validate: (input: any) => input === null || typeof input === "string",
    },
    noConfirm: {
        default: false,
        file_key: "no_confirm",
        switches: ["n", "no-confirm"],
        validate: (input: any) => typeof input === "boolean",
    },
    packageFileLocation: {
        default: "./package.json",
        file_key: "package_file_location",
        filter: (input: any) => resolve(input),
        switches: ["p", "package"],
        validate: (input: any) => typeof input === "string" && existsSync(input),
    },
    postCommitCommands: {
        default: [] as string[],
        file_key: "post_commit_commands",
        switches: false,
        validate: (input: any) => Array.isArray(input),
    },
    postCompleteCommands: {
        default: [] as string[],
        file_key: "post_complete_commands",
        switches: false,
        validate: (input: any) => Array.isArray(input),
    },
    preCommitCommands: {
        default: [] as string[],
        file_key: "pre_commit_commands",
        switches: false,
        validate: (input: any) => Array.isArray(input),
    },
    quiet: {
        default: false,
        file_key: false,
        switches: ["q", "quiet"],
        validate: (input: any) => typeof input === "boolean",
    },
    releaseMessage: {
        default: "Release {version}",
        file_key: "release_message",
        filter: (input: any) => {
            if (input === false) {
                return "Release {version}";
            } else {
                return input;
            }
        },
        switches: ["m", "set-release-message"],
        validate: (input: any) => input === true || typeof input === "string",
    },
    releaseType: {
        default: null as string,
        file_key: "release_type",
        switches: ["t", "release-type"],
        validate: (input: any) => input === null ||
            (typeof input === "string" && (input === "patch" || input === "minor" || input === "major")),
    },
    remote: {
        default: "origin",
        file_key: "remote",
        switches: ["o", "remote"],
        validate: (input: any) => typeof input === "string",
    },
    showHelp: {
        default: false,
        file_key: false,
        switches: ["h", "help"],
        validate: (input: any) => typeof input === "boolean",
    },
    skipGitFlowFinish: {
        default: false,
        file_key: "skip_git_flow_finish",
        switches: ["f", "skip-git-flow-finish"],
        validate: (input: any) => typeof input === "boolean",
    },
    skipGitPull: {
        default: false,
        file_key: "skip_git_pull",
        switches: ["l", "skip-git-pull"],
        validate: (input: any) => typeof input === "boolean",
    },
    skipGitPush: {
        default: false,
        file_key: "skip_git_push",
        switches: ["s", "skip-git-push"],
        validate: (input: any) => typeof input === "boolean",
    },
};

export class Options {
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

    private fileData: any = {};

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
