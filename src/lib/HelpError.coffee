###
  Generate Release
  Kevin Gravier
  MIT License
###

class HelpError extends Error
  constructor: (post) ->
    @message = """
      generate-release

      -r --readme           Path to README.md file. Default: ./README.md
      -p --package          Path to package.json file. Default: ./package.json
      -c --current-version  Current Version. Default: read from package.json
      -t --release-type     Release Type: patch, minor, major. Default: prompt
      -n --no-confirm       Do not ask for confirmation. Default: prompt for confirmation
      #{post or ''}"""

module.exports = HelpError
