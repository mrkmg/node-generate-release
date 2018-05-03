/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

require("es6-shim");
import Chai = require("chai");
import {SinonStub, stub, spy} from "sinon";
import {path} from "temp";
import {setupTestRepo} from "../helpers/setupTestRepo";
import {main} from "../../src";
import {readFileSync, existsSync} from "fs";
import {execSync} from "child_process";
import {GitCommands} from "../../src/lib/GitCommands";
import * as rimraf from "rimraf";

Chai.use(require("chai-as-promised"));
const assert = Chai.assert;

const helpMessage = `generate-release

-p, --package   FILE            Path to package.json file. Default: ./package.json
-c, --current-version VERSION   Current Version. Default: read from package.json
-v, --next-version VERSION      Next Version. Default: automatically bumps
-t, --release-type TYPE         Release Type: patch, minor, major. Ignored when next-version is given. Default: prompt, if next-version is undefined
-n, --no-confirm                Do not ask for confirmation. Default: prompt for confirmation
-l, --skip-git-pull             Do not pull from origin and rebase master and dev. Default: Do pull
-s, --skip-git-push             Do not push to origin when complete. Default: Do push
-f, --skip-git-flow-finish      Do not finish git-flow release. Default: Do finish
-d, --release-file FILE         Path to your .release.json file. Default: ./.release.json
-o, --remote REMOTE             Change the remote. Default: origin
-q, --quiet                     Less output. Default: Do show output
-m, release-message [MESSAGE]   Set a release message. If no message given, prompt for one. Will replace
                                "{version}" with the next version. Default: Release {version}



`;

describe("Run", () => {
    let runArguments: string[];
    let quietRunArguments: string[];
    let skipGitFlowFinishArguments: string[];
    let nextVersionRunArguments: string[];
    let helpArguments: string[];
    let exitStub: SinonStub;
    let startingDir: string;
    let tempDir: string;

    before(() => {
        runArguments = ["node", "script", "-t", "patch", "-n", "-l", "-s", "-o", "test"];
        quietRunArguments = ["node", "script", "-t", "patch", "-n", "-l", "-s", "-o", "test", "-q"];
        skipGitFlowFinishArguments = ["node", "script", "-t", "patch", "-n", "-l", "-s", "-f", "-o", "test"];
        nextVersionRunArguments = ["node", "script", "-t", "patch", "-n", "-l", "-s", "-v", "2.10.0", "-o", "test"];
        helpArguments = ["node", "script", "-h"];
    });

    beforeEach(() => {
        exitStub = stub(process, "exit");
        startingDir = process.cwd();
        tempDir = path();
        setupTestRepo(tempDir);
    });

    afterEach((cb) => {
        exitStub.restore();
        process.chdir(startingDir);
        rimraf(tempDir, cb);
    });

    it("Should run correctly", async () => {
        await main(runArguments);

        const packageFile = JSON.parse(readFileSync(`${tempDir}/package.json`).toString()) as any;
        const readmeFile = readFileSync(`${tempDir}/README.md`).toString();
        const tagCheckResult = execSync("git tag -l 1.2.4").toString();
        const tagMessageResult = execSync("git cat-file tag 1.2.4 | tail -n +6").toString();
        const branchCheckResult = execSync("git rev-parse --abbrev-ref HEAD").toString();

        assert.equal(packageFile.version, "1.2.4");
        assert.equal(readmeFile, "TEST FILE\n=========\n\n1.2.4");
        assert.equal(tagCheckResult, "1.2.4\n");
        assert.equal(tagMessageResult, "Release 1.2.4\n");
        assert.equal(branchCheckResult, "develop\n");
        assert(existsSync(`${tempDir}/pre_command`));
        assert(existsSync(`${tempDir}/post_command`));
        assert(existsSync(`${tempDir}/post_complete`));
        assert(!existsSync(`${tempDir}/deleteme`));
        assert(exitStub.calledWith(0));
    });

    it("Should be quiet", async () => {
        const outputSpy = spy(process.stdout, "write");
        try {
            await main(quietRunArguments);
            assert(!outputSpy.called);
        } finally {
            outputSpy.restore();
        }
    });

    it("Should be in release branch when skipped git-flow release finish", async () => {
        await main(skipGitFlowFinishArguments);

        const packageFile = JSON.parse(readFileSync(`${tempDir}/package.json`).toString()) as any;
        const readmeFile = readFileSync(`${tempDir}/README.md`).toString();
        const tagCheckResult = execSync("git tag -l 1.2.4").toString();
        const branchCheckResult = execSync("git rev-parse --abbrev-ref HEAD").toString();

        assert.equal(packageFile.version, "1.2.4");
        assert.equal(readmeFile, "TEST FILE\n=========\n\n1.2.4");
        assert.equal(tagCheckResult, "");
        assert.equal(branchCheckResult, "release/1.2.4\n");
        assert(exitStub.calledWith(0));
    });

    it("Should have run with given next version correctly", async () => {
        await main(nextVersionRunArguments);

        const packageFile = JSON.parse(readFileSync(`${tempDir}/package.json`).toString()) as any;
        const readmeFile = readFileSync(`${tempDir}/README.md`).toString();
        const tagCheckResult = execSync("git tag -l 2.10.0").toString();
        const tagMessageResult = execSync("git cat-file tag 2.10.0 | tail -n +6").toString();
        const branchCheckResult = execSync("git rev-parse --abbrev-ref HEAD").toString();

        assert.equal(packageFile.version, "2.10.0");
        assert.equal(readmeFile, "TEST FILE\n=========\n\n2.10.0");
        assert.equal(tagCheckResult, "2.10.0\n");
        assert.equal(tagMessageResult, "Release 2.10.0\n");
        assert.equal(branchCheckResult, "develop\n");
        assert(existsSync(`${tempDir}/pre_command`));
        assert(existsSync(`${tempDir}/post_command`));
        assert(existsSync(`${tempDir}/post_complete`));
        assert(!existsSync(`${tempDir}/deleteme`));
        assert(exitStub.calledWith(0));
    });

    it("Should reset on command failure", async () => {
        const commitStub = stub(GitCommands.prototype, "commit").throws();
        const resetSpy = spy(GitCommands.prototype, "reset");
        try {
            await main(runArguments);
        } catch (e) {
            console.log(e);
        }

        // assert(resetSpy.calledOnce);
        assert(exitStub.calledWith(1));

        commitStub.restore();
        resetSpy.restore();
    });

    it("Should show help", async () => {
        const outputSpy = spy(process.stdout, "write");
        try {
            await main(helpArguments);
            assert.equal(outputSpy.args[0][0], helpMessage);
            assert(exitStub.calledWith(0))
        } finally {
            outputSpy.restore();
        }
    });
});
