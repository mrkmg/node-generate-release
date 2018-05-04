"use strict";
/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var HelpError = /** @class */ (function (_super) {
    __extends(HelpError, _super);
    function HelpError(post) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "generate-release\n\n-p, --package   FILE            Path to package.json file. Default: ./package.json\n-c, --current-version VERSION   Current Version. Default: read from package.json\n-v, --next-version VERSION      Next Version. Default: automatically bumps\n-t, --release-type TYPE         Release Type: patch, minor, major. Ignored when next-version is given.\n                                    Default: prompt, if next-version is undefined\n-n, --no-confirm                Do not ask for confirmation. Default: prompt for confirmation\n-l, --skip-git-pull             Do not pull from origin and rebase master and dev. Default: Do pull\n-s, --skip-git-push             Do not push to origin when complete. Default: Do push\n-f, --skip-git-flow-finish,     Do not finish git-flow release. Default: Do finish\n    --skip-finish\n-d, --release-file FILE         Path to your .release.json file. Default: ./.release.json\n-o, --remote REMOTE             Change the remote. Default: origin\n-q, --quiet                     Less output. Default: Do show output\n-m, release-message [MESSAGE]   Set a release message. If no message given, prompt for one. Will replace\n                                    \"{version}\" with the next version. Default: Release {version}\n\n" + (post ? post : "") + "\n") || this;
        var proto = _newTarget.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(_this, proto);
        }
        else {
            _this.__proto__ = _newTarget.prototype;
        }
        return _this;
    }
    return HelpError;
}(Error));
exports.HelpError = HelpError;
