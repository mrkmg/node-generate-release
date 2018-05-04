/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

// tslint:disable-next-line:no-var-requires
require("es6-shim");
import Chai = require("chai");
import {execSync} from "child_process";
import {existsSync, readFileSync, writeFileSync} from "fs";
import * as Inquirer from "inquirer";
import * as rimraf from "rimraf";
import {SinonStub, spy, stub} from "sinon";
import {path} from "temp";
import {main} from "../../src";
import {GitCommands} from "../../src/lib/GitCommands";
import {setupGitFlowTestRepo} from "../helpers/setupTestRepo";
// tslint:disable-next-line:no-var-requires
Chai.use(require("chai-as-promised"));
const assert = Chai.assert;

const helpMessage = `generate-release

-p, --package   FILE            Path to package.json file. Default: ./package.json
-c, --current-version VERSION   Current Version. Default: read from package.json
-v, --next-version VERSION      Next Version. Default: automatically bumps
-t, --release-type TYPE         Release Type: patch, minor, major. Ignored when next-version is given.
                                    Default: prompt, if next-version is undefined
-n, --no-confirm                Do not ask for confirmation. Default: prompt for confirmation
-l, --skip-git-pull             Do not pull from origin and rebase master and dev. Default: Do pull
-s, --skip-git-push             Do not push to origin when complete. Default: Do push
-f, --skip-git-flow-finish,     Do not finish git-flow release. Default: Do finish
    --skip-finish
-d, --release-file FILE         Path to your .release.json file. Default: ./.release.json
-o, --remote REMOTE             Change the remote. Default: origin
-q, --quiet                     Less output. Default: Do show output
-m, release-message [MESSAGE]   Set a release message. If no message given, prompt for one. Will replace
                                    "{version}" with the next version. Default: Release {version}



`;

describe("Run - Git Flow", () => {
    let exitStub: SinonStub;
    let noPromptArguments: string[];
    let helpArguments: string[];
    let nextVersionRunArguments: string[];
    let quietRunArguments: string[];
    let withPromptArguments: string[];
    let skipGitFlowFinishArguments: string[];
    let startingDir: string;
    let tempDir: string;

    before(() => {
        noPromptArguments = ["node", "script", "-l", "-s", "-t", "patch", "-n", "-o", "test"];
        helpArguments = ["node", "script", "-h"];
        nextVersionRunArguments = ["node", "script", "-t", "patch", "-n", "-l", "-s", "-v", "2.10.0", "-o", "test"];
        quietRunArguments = ["node", "script", "-t", "patch", "-n", "-l", "-s", "-o", "test", "-q"];
        withPromptArguments = ["node", "script", "-t", "patch", "-n", "-o", "test"];
        skipGitFlowFinishArguments = ["node", "script", "-t", "patch", "-n", "-l", "-s", "-f", "-o", "test"];
        exitStub = stub(process, "exit");
    });

    beforeEach(() => {
        startingDir = process.cwd();
        tempDir = path();
        setupGitFlowTestRepo(tempDir);
    });

    afterEach((cb) => {
        exitStub.reset();
        process.chdir(startingDir);
        rimraf(tempDir, cb);
    });

    after(() => {
        exitStub.restore();
    });

    it("should run correctly", async () => {
        const pullStub = stub(GitCommands.prototype, "pull");
        const pushStub = stub(GitCommands.prototype, "push");
        try {
            await main(withPromptArguments);

            const packageFile = JSON.parse(readFileSync(`${tempDir}/package.json`).toString()) as any;
            const readmeFile = readFileSync(`${tempDir}/README.md`).toString();
            const tagCheckResult = execSync("git tag -l 1.2.4").toString();
            const tagMessageResult = execSync("git tag -l --format='%(contents)' 1.2.4").toString();
            const branchCheckResult = execSync("git rev-parse --abbrev-ref HEAD").toString();

            assert.equal(packageFile.version, "1.2.4");
            assert.equal(readmeFile, "TEST FILE\n=========\n\n1.2.4");
            assert.equal(tagCheckResult, "1.2.4\n");
            assert.equal(tagMessageResult, "Release 1.2.4\n\n");
            assert.equal(branchCheckResult, "develop\n");
            assert(existsSync(`${tempDir}/pre_command`));
            assert(existsSync(`${tempDir}/post_complete`));
            assert(!existsSync(`${tempDir}/deleteme`));
            assert(pullStub.called);
            assert(pushStub.called);
            assert(exitStub.calledWith(0));
        } finally {
            pullStub.restore();
            pushStub.restore();
        }
    });

    it("should be quiet", async () => {
        const outputSpy = spy(process.stdout, "write");
        try {
            await main(quietRunArguments);
            assert(!outputSpy.called);
        } finally {
            outputSpy.restore();
        }
    });

    it("should be in release branch when skipped git-flow release finish", async () => {
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

    it("should have run with given next version correctly", async () => {
        await main(nextVersionRunArguments);

        const packageFile = JSON.parse(readFileSync(`${tempDir}/package.json`).toString()) as any;
        const readmeFile = readFileSync(`${tempDir}/README.md`).toString();
        const tagCheckResult = execSync("git tag -l 2.10.0").toString();
        const tagMessageResult = execSync("git tag -l --format='%(contents)' 2.10.0").toString();
        const branchCheckResult = execSync("git rev-parse --abbrev-ref HEAD").toString();

        assert.equal(packageFile.version, "2.10.0");
        assert.equal(readmeFile, "TEST FILE\n=========\n\n2.10.0");
        assert.equal(tagCheckResult, "2.10.0\n");
        assert.equal(tagMessageResult, "Release 2.10.0\n\n");
        assert.equal(branchCheckResult, "develop\n");
        assert(existsSync(`${tempDir}/pre_command`));
        assert(existsSync(`${tempDir}/post_complete`));
        assert(!existsSync(`${tempDir}/deleteme`));
        assert(exitStub.calledWith(0));
    });

    it("should reset on command failure", async () => {
        const commitStub = stub(GitCommands.prototype, "commit").throws();
        const resetSpy = spy(GitCommands.prototype, "reset");
        try {
            await main(noPromptArguments);
            assert(resetSpy.calledOnce);
            assert(exitStub.calledWith(1));
        } finally {
            commitStub.restore();
            resetSpy.restore();
        }
    });

    it("should fail on dirty working directory", async () => {
        const outputSpy = spy(process.stdout, "write");
        try {
            writeFileSync(`${tempDir}/README.md`, "CHANGES");
            await main(noPromptArguments);
            assert.equal(outputSpy.args[0][0], "The working directory is not clean.\n");
        } finally {
            outputSpy.restore();
        }
    });

    it("should show help", async () => {
        const outputSpy = spy(process.stdout, "write");
        try {
            await main(helpArguments);
            assert.equal(outputSpy.args[0][0], helpMessage);
            assert(exitStub.calledWith(0));
        } finally {
            outputSpy.restore();
        }
    });

    it("should ask questions", async () => {
        const outputSpy = spy(process.stdout, "write");
        const promptStub = stub(Inquirer, "prompt")
            .onCall(0).resolves({release: "patch"})
            .onCall(1).resolves({message: "CUSTOM Version 1.2.4\n"})
            .onCall(2).resolves({confirm: true});

        try {
            await main(["node", "script", "-l", "-s", "-m"]);

            const packageFile = JSON.parse(readFileSync(`${tempDir}/package.json`).toString()) as any;
            const readmeFile = readFileSync(`${tempDir}/README.md`).toString();
            const tagCheckResult = execSync("git tag -l 1.2.4").toString();
            const tagMessageResult = execSync("git tag -l --format='%(contents)' 1.2.4").toString();
            const branchCheckResult = execSync("git rev-parse --abbrev-ref HEAD").toString();

            assert.equal(packageFile.version, "1.2.4");
            assert.equal(readmeFile, "TEST FILE\n=========\n\n1.2.4");
            assert.equal(tagCheckResult, "1.2.4\n");
            assert.equal(tagMessageResult, "CUSTOM Version 1.2.4\n\n");
            assert.equal(branchCheckResult, "develop\n");
            assert(existsSync(`${tempDir}/pre_command`));
            assert(existsSync(`${tempDir}/post_complete`));
            assert(!existsSync(`${tempDir}/deleteme`));
            assert(exitStub.calledWith(0));
        } finally {
            outputSpy.restore();
            promptStub.restore();
        }
    });

    it("should cancel", async () => {
        const outputSpy = spy(process.stdout, "write");
        const promptStub = stub(Inquirer, "prompt").resolves(false);
        try {
            await main(["node", "script", "-t", "patch"]);
            assert.equal(outputSpy.args[0][0], "Release Was Canceled.\n");
            assert(exitStub.calledWith(0));
        } finally {
            outputSpy.restore();
            promptStub.restore();
        }
    });
});
