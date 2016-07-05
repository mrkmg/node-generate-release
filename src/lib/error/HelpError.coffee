###
  Generate Release
  Kevin Gravier
  MIT License
###

class HelpError extends Error
  constructor: (post) ->
    @message = """
      generate-release

      -p, --package   FILE            Path to package.json file. Default: ./package.json
      -c, --current-version VERSION   Current Version. Default: read from package.json
      -t, --release-type TYPE         Release Type: patch, minor, major. Default: prompt
      -n, --no-confirm                Do not ask for confirmation. Default: prompt for confirmation
      -l, --skip-git-pull             Do not pull from origin and rebase master and dev. Default: Do pull
      -s, --skip-git-push             Do not push to origin when complete. Default: Do push
      -d, --release-file FILE         Path to your .release.json file. Default: ./.release.json
      -o, --remote REMOTE             Change the remote. Default: origin
      -q, --quiet                     Less output. Default: Do show output
      -m, release-message [MESSAGE]   Set a release message. If no message given, prompt for one. Will replace
                                      "{version}" with the next version. Default: Release {version}
      #{post or ''}"""

module.exports = HelpError
