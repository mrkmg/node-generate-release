###
  Generate Release
  Kevin Gravier
  MIT License
###

existsSync = require 'exists-sync'
Path = require 'path'
bool = require '@nkcmr/bool'
HelpError = require './HelpError'

args =
  show_help: ['h', 'help']
  readme_file_location: ['r', 'readme']
  package_file_location: ['p', 'package']
  current_version: ['c', 'current-version']
  release_type: ['t', 'release-type']
  no_confirm: ['n', 'no-confirm']
  skip_git_pull: ['l', 'skip-git-push']
  skip_git_push: ['s', 'skip-git-push']

class Options
  readme_file_location: './README.md'
  package_file_location: './package.json'
  no_confirm: false
  release_type: null
  current_version: null
  skip_git_pull: true
  skip_git_push: true

  validation_error: '\n'
  parseArgs: (args) ->
    @args = args

    if @getArgumentValue 'show_help'
      throw new HelpError

    @no_confirm = (@getArgumentValue 'no_confirm') or @no_confirm
    @skip_git_push = (@getArgumentValue 'skip_git_push') or @skip_git_push
    @skip_git_pull = (@getArgumentValue 'skip_git_pull') or @skip_git_pull
    @readme_file_location = Path.resolve( (@getArgumentValue 'readme_file_location') or @readme_file_location )
    @package_file_location = Path.resolve( (@getArgumentValue 'package_file_location') or @package_file_location )
    @current_version = (@getArgumentValue 'current_version') or @current_version
    @release_type = (@getArgumentValue 'release_type') or @release_type
    @validateArguments()
  validateArguments: ->
    ret = true;
    ret &= @validateReadmeFileLocation()
    ret &= @validatePackageFileLocation()
    ret &= @validateReleaseType()
    ret &= @validateNoConfirm()
    ret &= @validateSkipGitPull()
    ret &= @validateSkipGitPush()
    ret or throw new HelpError(@validation_error)
  validateReadmeFileLocation: ->
    unless existsSync @readme_file_location
      @validation_error += "Readme does not exist: #{@readme_file_location}\n"
      false
    else
      true
  validatePackageFileLocation: ->
    unless existsSync @package_file_location
      @validation_error += "Package file does not exist: #{@package_file_location}\n"
      false
    else
      true
  validateCurrentVersion: ->
    unless (not @current_version) or (@current_version.test /(\d+\.){2}\d+/)
      @validation_error += "Invalid current version: #{@current_version}\n"
      false
    else
      true
  validateReleaseType: ->
    unless (not @release_type) or (@release_type in ['patch', 'minor', 'major'])
      @validation_error += "Unknown release type: #{@release_type}\n"
      false
    else
      true
  validateNoConfirm: ->
    unless typeof @no_confirm is 'boolean'
      @validation_error += 'Invalid value for no-confirm\n'
      false
    else
      true
  validateSkipGitPush: ->
    unless typeof @skip_git_push is 'boolean'
      @validation_error += 'Invalid value for skip-git-push\n'
      false
    else
      true
  validateSkipGitPull: ->
    unless typeof @skip_git_pull is 'boolean'
      @validation_error += 'Invalid value for skip-git-pull\n'
      false
    else
      true
  getArgumentValue: (argument) ->
    t = @
    (t.args[arg] for arg in args[argument] when t.args[arg])[0]

module.exports = Options
