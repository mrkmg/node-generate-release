###
  Generate Release
  Kevin Gravier
  MIT License
###

class HelpError extends Error
  constructor: (post) ->
    @message = """
      generate-release

      -r, --readme               Path to README.md file. Default: ./README.md
      -p, --package              Path to package.json file. Default: ./package.json
      -c, --current-version      Current Version. Default: read from package.json
      -t, --release-type         Release Type: patch, minor, major. Default: prompt
      -n, --no-confirm           Do not ask for confirmation. Default: prompt for confirmation
      -l, --skip-git-pull        Do not pull from origin and rebase master and dev. Default: Do pull
      -s, --skip-git-push        Do not push to origin when complete. Default: Do push
      -d, --release-file         Path to your .release.json file. Default: ./.release.json
      -m, --set-release-message  Prompt to write a release message. Default: Release {version}
      -o, --remote               Change the remote. Default: origin

      #{post or ''}"""

module.exports = HelpError
