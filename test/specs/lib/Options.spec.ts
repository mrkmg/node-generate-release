/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import Chai = require("chai");
import {resolve} from "path";
import * as rimraf from "rimraf";
import {path} from "temp";
import {Options} from "../../../src/lib/Options";
import {setupTestRepo} from "../../helpers/setupTestRepo";
// tslint:disable-next-line:no-var-requires
Chai.use(require("chai-as-promised"));
const assert = Chai.assert;

describe("Options", () => {
    let startingDir: string;
    let tempDir: string;

    before(() => {
        startingDir = process.cwd();
        tempDir = path();
        setupTestRepo(tempDir);
    });

    after((cb) => {
        process.chdir(startingDir);
        rimraf(tempDir, cb);
    });

    it("should have default options set properly", () => {
        const options = new Options([]);

        assert.equal(options.packageFileLocation, resolve("./package.json"));
        assert.equal(options.dotReleaseFileLocation, resolve("./.release.json"));
        assert.equal(options.remote, "origin");
        assert.equal(options.currentVersion, null);
        assert.equal(options.releaseType, null);
        assert.equal(options.noConfirm, false);
        assert.equal(options.skipGitPull, false);
        assert.equal(options.skipGitPush, false);
        assert.equal(options.releaseMessage, "Release {version}");
        assert.sameMembers(options.filesToVersion, ["README.md"]);
    });

    it("should parse cli options properly", () => {
        const options = new Options([
            "node", "script",
            "-p", "alt.package.json",
            "-c", "1.2.3",
            "-t", "patch",
            "-d", ".alt.release.json",
            "-o", "test",
            "-n",
            "-l",
            "-s",
            "-m",
        ]);
        assert.equal(options.packageFileLocation, resolve("./alt.package.json"));
        assert.equal(options.dotReleaseFileLocation, resolve("./.alt.release.json"));
        assert.equal(options.remote, "test");
        assert.equal(options.currentVersion, "1.2.3");
        assert.equal(options.releaseType, "patch");
        assert.equal(options.noConfirm, true);
        assert.equal(options.skipGitPull, true);
        assert.equal(options.skipGitPush, true);
        assert.equal(options.releaseMessage, true);
    });

    it("should parse the release config from package.json", () => {
        const options = new Options([
            "node", "script",
            "-p", "alt.package.json",
        ]);

        assert.equal(options.releaseMessage, "Alt Package Message {version}");
    });

    it("should parse release file options correctly", () => {
        const options = new Options([
            "node", "script",
            "-d", "./.all.release.json",
        ]);

        assert.equal(options.packageFileLocation, resolve("./alt.package.json"));
        assert.equal(options.remote, "test4");
        assert.equal(options.noConfirm, true);
        assert.equal(options.skipGitPull, true);
        assert.equal(options.skipGitPush, true);
        assert.equal(options.releaseMessage, "Testing Message {version}");
        assert.sameMembers(options.preCommitCommands, ["test1"]);
        assert.sameMembers(options.postCommitCommands, ["test2"]);
        assert.sameMembers(options.filesToCommit, ["test3"]);
        assert.sameMembers(options.filesToVersion, ["test5"]);
    });
});
