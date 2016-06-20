###
  Generate Release
  Kevin Gravier
  MIT License
###

IS_DEBUG = process.env.IS_DEBUG?
IS_TEST = process.env.IS_TEST?

Promise = require 'bluebird'
Minimist = require 'minimist'
Glob = require 'glob'
Path = require 'path'

Options = require './lib/Options'
GitCommands = require './lib/GitCommands'
PackageFile = require './lib/PackageFile'
GitFlowSettings = require './lib/GitFlowSettings'

askReleaseType = require './lib/askReleaseType'
incrementVersion = require './lib/incrementVersion'
askConfirmUpdate = require './lib/askConfirmUpdate'
writeNewReadme = require './lib/writeNewReadme'
runArbitraryCommand = require './lib/runArbitraryCommand'

module.exports = (args) ->
  options = undefined
  package_file = undefined
  git_flow_settings = undefined

  Promise
  #Parse Arguments
  .try ->
    args.slice 2
  .then Minimist
  .then (mArgs) ->
    options = new Options mArgs
  .then ->
    options.parse()

  #Retreive Git Flow Settings
  .then ->
    git_flow_settings = new GitFlowSettings Path.resolve './'
  .then ->
    git_flow_settings.parseIni()

  #Check for Clean Working Dir
  .then ->
    unless IS_TEST
      GitCommands.checkForCleanWorkingDirectory()

  #Get Release Type from options or by asking
  .then ->
    unless options.release_type
      askReleaseType()
      .then (release_type) ->
        options.release_type = release_type

  #Get Current Version
  .then ->
    package_file = new PackageFile options.package_file_location
  .then ->
    package_file.load()
  .then ->
    unless options.current_version
      options.current_version = package_file.getVersion()

  #Bump Version
  .then ->
    options.next_version = incrementVersion options.current_version, options.release_type, git_flow_settings.version_tag_prefix

  #Confirm the Release
  .then ->
    options.no_confirm or (askConfirmUpdate options.current_version, options.next_version)
  .then (do_update) ->
    unless do_update
      throw new Error 'Update Canceled'

  #Start the Git-Flow release
  .then ->
    unless IS_TEST
      GitCommands.preCommands options.next_version, options.skip_git_pull, git_flow_settings.master, git_flow_settings.develop
    else
      console.info "TEST: GitCommands.preCommands
        #{options.next_version}, #{options.skip_git_pull}, #{git_flow_settings.master}, #{git_flow_settings.develop}"

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
      Promise
      .try ->
        runArbitraryCommand command for command in options.pre_commit_commands
      .catch (err) ->
        GitCommands.reset options.next_version, git_flow_settings.master, git_flow_settings.develop
        throw err
    else
      console.info "TEST: EXEC: #{command}" for command in options.pre_commit_commands

  #Commit all applicable files
  .then ->
    files = [options.readme_file_location, options.package_file_location]
    for file in options.additional_files_to_commit
      tmp_files = Glob.sync file
      for tmp_file in tmp_files
        files.push Path.resolve tmp_file

    unless IS_TEST
      GitCommands.postCommands options.next_version, files, options.skip_git_push, git_flow_settings.master, git_flow_settings.develop
    else
      console.info "TEST: GitCommands.postCommands
        #{options.next_version}, #{files}, #{options.skip_git_push}, #{git_flow_settings.master}, #{git_flow_settings.develop}"

  #Run post_commit_commands
  .then ->
    unless IS_TEST
      #Run all post commit commands, ignoring any errors as it's too late to go back now. (We already pushed)
      promises = (Promise.try( -> runArbitraryCommand(command)).catch(->) for command in options.post_commit_commands)

      Promise.all promises
    else
      console.info "TEST: EXEC: #{command}" for command in options.post_commit_commands

  #Print the errors
  .catch (err) ->
    if IS_DEBUG
      throw err
    console.log err.message
    process.exit 1
