###
  Generate Release
  Kevin Gravier
  MIT License
###

IS_DEBUG = process.env.IS_DEBUG?
IS_TEST = process.env.IS_TEST?

Promise = require 'bluebird'
Minimist = require 'minimist'
ChildProcess = require 'child_process'

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
  #Get Commands
  .try ->
    args.slice 2
  .then Minimist
  .then (args) ->
    options.parseArgs args

  #Check for Clean Working Dir
  .then ->
    IS_TEST or GitCommands.checkForCleanWorkingDirectory()

  #Get Release Type from options or by asking
  .then ->
    unless options.release_type
      askReleaseType()
      .then (release_type) ->
        options.release_type = release_type

  #Get Current Version
  .then ->
    package_file.load options.package_file_location
  .then ->
    unless options.current_version
      options.current_version = package_file.getVersion()
    options.next_version = incrementVersion options.current_version, options.release_type

  #Confirm the Release
  .then ->
    options.no_confirm or (askConfirmUpdate options.current_version, options.next_version)
  .then (do_update) ->
    unless do_update
      throw new Error 'Update Canceled'

  #Start the Git-Flow release
  .then ->
    unless IS_TEST
      GitCommands.preCommands options.next_version, options.skip_git_pull
    else
      console.info "TEST: GitCommands.preCommands #{options.next_version}, #{options.skip_git_pull}"

  #Write the new version to the readme file
  .then ->
    unless IS_TEST
      writeNewReadme options.readme_file_location, options.current_version, options.next_version
    else
      console.info "TEST: writeNewReadme #{options.readme_file_location}, #{options.current_version}, #{options.next_version}"

  #Write the new version to the package file
  .then ->
    unless IS_TEST
      package_file.setVersion options.next_version
      package_file.save()
    else
      console.info "TEST: package_file.setVersion #{options.next_version} && package_file.save()"

  #Run any pre_commit_commands
  .then ->
    unless IS_TEST
      ChildProcess.spawnSync(command, [], {cwd: process.cwd()}) for command in options.pre_commit_commands
    else
      console.info "TEST: EXEC: #{command}" for command in options.pre_commit_commands

  #Commit all applicable files
  .then ->
    files = [options.readme_file_location, options.package_file_location].concat options.additional_files_to_commit
    unless IS_TEST
      GitCommands.postCommands options.next_version, files, options.skip_git_push
    else
      console.info "TEST: GitCommands.postCommands #{options.next_version}, #{files}, #{options.skip_git_push}"

  #Print the errors
  .catch (err) ->
    if IS_DEBUG
      throw err
    console.log err.message
    process.exit 1
