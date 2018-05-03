/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import Chai = require("chai");
import {incrementVersion} from "../../../../src/lib/helper/incrementVersion";
Chai.use(require("chai-as-promised"));
const assert = Chai.assert;

describe("incrementVersion", () => {
    it("increment without prefix", () => {
        assert.equal(incrementVersion("1.2.3", "patch"), "1.2.4");
        assert.equal(incrementVersion("1.2.3", "minor"), "1.3.0");
        assert.equal(incrementVersion("1.2.3", "major"), "2.0.0");
    });

    it("throws on invalid versions", () => {
        assert.throws(() => {
            incrementVersion("1", "patch");
        });
    });

    it("throws on unknown bump type", () => {
        assert.throws(() => {
            incrementVersion("1.2.3", "other" as "patch");
        });
    });
});
