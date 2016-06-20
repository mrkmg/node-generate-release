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
ParseSpawnArgs = require 'parse-spawn-args'
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

module.exports = (args) ->
  options = new Options()
  package_file = new PackageFile()
  git_flow_settings = new GitFlowSettings('./')

  Promise
  #Get Commands
  .try ->
    args.slice 2
  .then Minimist
  .then (args) ->
    options.parseArgs args

  #Retreive Git Flow Settings
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
    package_file.load options.package_file_location
  .then ->
    unless options.current_version
      options.current_version = package_file.getVersion()
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
      for command_string in options.pre_commit_commands
        command_array = ParseSpawnArgs.parse command_string
        command = command_array.shift()
        ret = ChildProcess.spawnSync command, command_array

        if ret.error
          GitCommands.reset options.next_version, git_flow_settings.master, git_flow_settings.develop
          throw ret.error
        if ret.status isnt 0
          GitCommands.reset options.next_version, git_flow_settings.master, git_flow_settings.develop
          throw new Error "`#{command_string}` returned #{ret.status}. \n\n #{ret.output.toString()}"

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
      for command_string in options.post_commit_commands
        command_array = ParseSpawnArgs.parse command_string
        command = command_array.shift()
        ret = ChildProcess.spawnSync command, command_array

        unless ret
          throw ret.error
    else
      console.info "TEST: EXEC: #{command}" for command in options.post_commit_commands

  #Print the errors
  .catch (err) ->
    if IS_DEBUG
      throw err
    console.log err.message
    process.exit 1
