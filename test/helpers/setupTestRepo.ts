/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {execSync} from "child_process";
import {mkdirSync, writeFileSync} from "fs";

const readmeMd = `TEST FILE
=========

1.2.3`;

const packageJson = `{
    "version":"1.2.3"
}`;

const altPackageJson = `{
    "version":"1.2.3",
    "config": {
        "generateRelease": {
            "release_message": "Alt Package Message {version}"
        }
    }
}`;

const releaseJson = `{
    "pre_commit_commands": ["touch ./pre_command", "rm -f deleteme"],
    "post_complete_commands": ["touch ./post_complete"],
    "files_to_commit": ["pre_command"]
}`;

const allReleaseJson = `{
    "readme_file_location": "./alt.README.md",
    "package_file_location": "./alt.package.json",
    "no_confirm": true,
    "skip_git_pull": true,
    "skip_git_push": true,
    "pre_commit_commands": ["test1"],
    "post_commit_commands": ["test2"],
    "files_to_commit": ["test3"],
    "files_to_version": ["test5"],
    "release_message": "Testing Message {version}",
    "remote": "test4"
}`;

export function setupGitFlowTestRepo(tempDir: string) {
    mkdirSync(tempDir);
    process.chdir(tempDir);
    writeFileSync("package.json", packageJson);
    writeFileSync("alt.package.json", altPackageJson);
    writeFileSync(".release.json", releaseJson);
    writeFileSync(".alt.release.json", releaseJson);
    writeFileSync(".all.release.json", allReleaseJson);
    writeFileSync("README.md", readmeMd);
    writeFileSync("deleteme", "testfile");

    execSync("git init", {stdio: "ignore"});
    execSync("git add -A");
    execSync('git commit -m "Commit"', {stdio: "pipe"});
    execSync("git flow init -d", {stdio: "pipe"});
}

export function setupGitStreamTestRepo(tempDir: string) {
    mkdirSync(tempDir);
    process.chdir(tempDir);
    writeFileSync("package.json", packageJson);
    writeFileSync("alt.package.json", altPackageJson);
    writeFileSync(".release.json", releaseJson);
    writeFileSync(".alt.release.json", releaseJson);
    writeFileSync(".all.release.json", allReleaseJson);
    writeFileSync("README.md", readmeMd);
    writeFileSync("deleteme", "testfile");

    execSync("git init", {stdio: "ignore"});
    execSync("git add -A");
    execSync('git commit -m "Commit"', {stdio: "pipe"});
    execSync("git stream init -d", {stdio: "pipe"});
}
