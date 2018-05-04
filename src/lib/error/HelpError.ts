/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

export class HelpError extends Error {
    constructor(post?: string) {
        super(`generate-release

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

${post ? post : ""}
`);
        const proto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, proto);
        } else {
            (this as any).__proto__ = new.target.prototype;
        }
    }
}
