/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import Chai = require("chai");
import {path} from "temp";
import {writeFileSync, unlinkSync, readFileSync} from "fs";
import {replaceVersionInFile} from "../../../../src/lib/helper/replaceVersionInFile";

Chai.use(require("chai-as-promised"));
const assert = Chai.assert;

describe("replaceVersionInFile", () => {
    let filePath: string;

    before(() => {
        filePath = path(".md");
    });

    beforeEach(() => {
        writeFileSync(filePath, "abc 1.2.3 abc");
    });

    afterEach(() => {
        unlinkSync(filePath);
    });

    it("should write new version to readme correctly", () => {
        replaceVersionInFile(filePath, "1.2.3", "1.2.4");
        const message = readFileSync(filePath).toString();
        assert.equal(message, "abc 1.2.4 abc");
    });
});
