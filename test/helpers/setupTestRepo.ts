/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {execSync} from "child_process";
import {writeFileSync, mkdirSync} from "fs";

const readme_md = `TEST FILE
=========

1.2.3`;

const package_json = `{
    "version":"1.2.3"
}`;

const alt_package_json = `{
    "version":"1.2.3",
    "config": {
        "generateRelease": {
            "release_message": "Alt Package Message {version}"
        }
    }
}`;

const release_json = `{
    "pre_commit_commands": ["touch ./pre_command", "rm -f deleteme"],
    "post_commit_commands": ["touch ./post_command"],
    "post_complete_commands": ["touch ./post_complete"]
}`;

const all_release_json = `{
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


export function setupTestRepo(tempDir: string) {
    mkdirSync(tempDir);
    process.chdir(tempDir);
    writeFileSync("package.json", package_json);
    writeFileSync("alt.package.json", alt_package_json);
    writeFileSync(".release.json", release_json);
    writeFileSync(".alt.release.json", release_json);
    writeFileSync(".all.release.json", all_release_json);
    writeFileSync("README.md", readme_md);
    writeFileSync("deleteme", "testfile");

    execSync('git init', {stdio: 'ignore'});
    execSync('git add -A');
    execSync('git commit -m "Commit"', {stdio: 'pipe'});
    execSync('git flow init -d', {stdio: 'pipe'});
}
