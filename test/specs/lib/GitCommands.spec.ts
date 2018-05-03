/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import Chai = require("chai");
import * as childProcess from "child_process";
import {SinonStub, stub} from "sinon";
import {GitCommands} from "../../../src/lib/GitCommands";
// tslint:disable-next-line:no-var-requires
Chai.use(require("chai-as-promised"));
const assert = Chai.assert;

describe("GitCommands", () => {
    let settings: any;
    let spawnSyncStub: SinonStub;
    let gitCommands: GitCommands;

    before(() => {
        settings = {
            currentVersion: "test_current_version",
            developBranch: "test_develop_branch",
            masterBranch: "test_master_branch",
            nextVersion: "test_next_version",
            releaseMessage: "test_release_message",
            remote: "test_remote",
        };

        spawnSyncStub = stub(childProcess, "spawnSync").callsFake(() => ({status: 0}));
    });

    beforeEach(() => {
        gitCommands = new GitCommands(settings);
    });

    afterEach(() => {
        spawnSyncStub.resetHistory();
    });

    after(() => {
        spawnSyncStub.restore();
    });

    it("pull", () => {
        gitCommands.pull();

        assert.deepEqual(spawnSyncStub.args[0][1], ["fetch", "test_remote"]);
        assert.deepEqual(spawnSyncStub.args[1][1], ["checkout", "test_develop_branch"]);
        assert.deepEqual(spawnSyncStub.args[2][1], ["pull", "test_remote", "test_develop_branch", "--rebase"]);
        assert.deepEqual(spawnSyncStub.args[3][1], ["checkout", "test_master_branch"]);
        assert.deepEqual(spawnSyncStub.args[4][1], ["reset", "--hard", "test_remote/test_master_branch"]);
    });

    it("push", () => {
        gitCommands.push();
        assert.deepEqual(spawnSyncStub.args[0][1], ["push", "test_remote", "test_develop_branch"]);
        assert.deepEqual(spawnSyncStub.args[1][1], ["push", "test_remote", "test_master_branch"]);
        assert.deepEqual(spawnSyncStub.args[2][1], ["push", "test_remote", "--tags"]);
    });

    it("reset", () => {
        gitCommands.reset();
        assert.deepEqual(spawnSyncStub.args[0][1], ["checkout", "test_develop_branch"]);
        assert.deepEqual(spawnSyncStub.args[1][1], ["reset", "--hard", "HEAD"]);
        assert.deepEqual(spawnSyncStub.args[2][1], ["branch", "-D", "release/test_next_version"]);
    });

    it("start", () => {
        gitCommands.start();
        assert.deepEqual(spawnSyncStub.args[0][1], ["checkout", "test_develop_branch"]);
        assert.deepEqual(spawnSyncStub.args[1][1], ["flow", "release", "start", "test_next_version"]);
    });

    it("commit", () => {
        gitCommands.commit(["test_file"]);
        assert.deepEqual(spawnSyncStub.args[1][1], ["add", "test_file"]);
        assert.deepEqual(spawnSyncStub.args[2][1], ["commit", "-m", "test_release_message"]);
    });

    it("finish", () => {
        gitCommands.isAvh = false;
        gitCommands.finish();
        assert.deepEqual(spawnSyncStub.args[0][1], [
            "flow", "release", "finish", "-m", "test_release_message", "test_next_version",
        ]);
    });
});
