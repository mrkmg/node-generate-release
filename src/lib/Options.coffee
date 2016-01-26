###
  Generate Release
  Kevin Gravier
  MIT License
###

existsSync = require 'exists-sync'
Path = require 'path'
bool = require '@nkcmr/bool'

args =
  readme_file_location: ['m', 'readme']
  package_file_location: ['p', 'package']
  current_version: ['c', 'current-version']
  release_type: ['r', 'release']
  no_confirm: ['n', 'no-confirm']


class Options
  readme_file_location: './README.md'
  package_file_location: './package.json'
  no_confirm: false
  release_type: null
  current_version: null
  parseArgs: (args) ->
    @args = args
    @no_confirm = bool @getArgumentValue 'no_confirm'
    @readme_file_location = Path.resolve( (@getArgumentValue 'readme_file_location') or @readme_file_location )
    @package_file_location = Path.resolve( (@getArgumentValue 'package_file_location') or @package_file_location )
    @current_version = (@getArgumentValue 'current_version') or @current_version
    @release_type = (@getArgumentValue 'release_type') or @release_type
    @validateArguments()
  validateArguments: ->
    @validateReadmeFileLocation() or
    @validatePackageFileLocation() or
    @validateReleaseType() or
    @validateNoConfirm()
  validateReadmeFileLocation: ->
    existsSync @readme_file_location
  validatePackageFileLocation: ->
    existsSync @package_file_location
  validateCurrentVersion: ->
    (not @current_version) or (@current_version.test /(\d+\.){2}\d+/)
  validateReleaseType: ->
    (not @release_type) or (@release_type in ['patch', 'minor', 'major'])
  validateNoConfirm: ->
    typeof @no_confirm is 'boolean'
  getArgumentValue: (argument) ->
    t = @
    (t.args[arg] for arg in args[argument] when t.args[arg])[0]

module.exports = Options
