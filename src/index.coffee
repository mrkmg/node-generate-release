###
  Generate Release
  Kevin Gravier
  MIT License
###

IS_DEBUG = process.env.IS_DEBUG?

Promise = require 'bluebird'
Minimist = require 'minimist'

Options = require './lib/Options'
GitCommands = require './lib/GitCommands'
PackageFile = require './lib/PackageFile'

askReleaseType = require './lib/askReleaseType'
incrementVersion = require './lib/incrementVersion'
askConfirmUpdate = require './lib/askConfirmUpdate'
writeNewReadme = require './lib/writeNewReadme'

module.exports = (args) ->
  options = new Options()
  package_file = new PackageFile()

  Promise
  .try ->
    args.slice 2
  .then Minimist
  .then (args) ->
    options.parseArgs args
  .then ->
    IS_DEBUG or GitCommands.checkForCleanWorkingDirectory()
  .then ->
    unless options.release_type
      askReleaseType()
      .then (release_type) ->
        options.release_type = release_type
  .then ->
    package_file.load options.package_file_location
  .then ->
    unless options.current_version
      options.current_version = package_file.get 'version'
    options.next_version = incrementVersion options.current_version, options.release_type
  .then ->
    options.no_confirm or (askConfirmUpdate options.current_version, options.next_version)
  .then (do_update) ->
    unless do_update
      throw new Error 'Update Canceled'
  .then ->
    if IS_DEBUG
      console.log "Would have written to #{options.next_version} to \n#{options.package_file_location}\n#{options.readme_file_location}"
      throw new Error 'But, your in debug mode so nothing actually happened'
  .then ->
    GitCommands.preCommands options.next_version, options.skip_git_pull
  .then ->
    writeNewReadme options.readme_file_location, options.current_version, options.next_version
  .then ->
    package_file.set 'version', options.next_version
    package_file.save()
  .then ->
    files = [options.readme_file_location, options.package_file_location]
    GitCommands.postCommands options.next_version, files, options.skip_git_push
  .catch (err) ->
    if IS_DEBUG
      throw err
    console.log err.message
    process.exit 1
