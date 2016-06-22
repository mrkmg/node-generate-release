###
  Generate Release
  Kevin Gravier
  MIT License
###

IS_DEBUG = process.env.IS_DEBUG?

Promise = require 'bluebird'
Minimist = require 'minimist'
Glob = require 'glob'
Path = require 'path'
Observatory = require 'observatory'

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
  git_commands = undefined

  Observatory.settings
    prefix: '[Generate Release] '

  observatory_tasks =
    git_pull: Observatory.add('GIT: Pull from Origin')
    git_start: Observatory.add('GIT: Start Release')
    write_files: Observatory.add('Files: Write New Version')
    pre_commit_commands: Observatory.add('Commands: Pre Commit')
    git_commit: Observatory.add('GIT: Commit Files')
    post_commit_commands: Observatory.add('Commands: Post Commit')
    git_finish: Observatory.add('GIT: Finish Release')
    git_push: Observatory.add('GIT: Push to Origin')


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

  #Setup the Git Commands
  .then ->
    git_commands = new GitCommands
      master_branch: git_flow_settings.master
      develop_branch: git_flow_settings.develop
      current_version: options.current_version
      next_version: options.next_version

  #Git Pull
  .then ->
    unless options.skip_git_pull
      observatory_tasks.git_pull.status('Pulling')
      git_commands.pull()
      observatory_tasks.git_pull.done('Complete')
    else
      observatory_tasks.git_pull.done('Skipped')

  .then ->
    observatory_tasks.git_start.status('Starting')
    git_commands.start()
    observatory_tasks.git_start.done('Complete')

  .then ->
    observatory_tasks.write_files.status('readme')
    writeNewReadme options.readme_file_location, options.current_version, options.next_version

  .then ->
    observatory_tasks.write_files.status('package')
    package_file.setVersion options.next_version
    package_file.save()
    observatory_tasks.write_files.done('Complete')

  .then ->
    Promise
    .try ->
      observatory_tasks.pre_commit_commands.status('Running')
      for command in options.pre_commit_commands
        observatory_tasks.pre_commit_commands.status command
        runArbitraryCommand command for command in options.pre_commit_commands
      observatory_tasks.pre_commit_commands.done('Complete')
    .catch (err) ->
      git_commands.reset()
      throw err

  .then ->
    files = [options.readme_file_location, options.package_file_location]
    for file in options.additional_files_to_commit
      tmp_files = Glob.sync file
      for tmp_file in tmp_files
        files.push Path.resolve tmp_file
    files

  .then (files) ->
    Promise
    .try ->
      observatory_tasks.git_commit.status('Committing')
      git_commands.commit files
      observatory_tasks.git_commit.done('Complete')
    .catch (err) ->
      git_commands.reset()
      throw err

  .then ->
    observatory_tasks.pre_commit_commands.status('Running')

    for command in options.post_commit_commands
      try
        observatory_tasks.pre_commit_commands.status command
        runArbitraryCommand command
      catch error
        console.error error.message

    observatory_tasks.pre_commit_commands.done('Complete')

  .then ->
    Promise
    .try ->
      observatory_tasks.git_finish.status('Finishing')
      git_commands.finish()
      observatory_tasks.git_finish.done('Complete')
    .catch (err) ->
      git_commands.reset()
      throw err

  .then ->
    unless options.skip_git_push
      observatory_tasks.git_push.status('Pushing')
      git_commands.push()
      observatory_tasks.git_push.done('Complete')
    else
      observatory_tasks.git_push.done('Skipped')

  #Print the errors
  .catch (err) ->
    if IS_DEBUG
      throw err
    console.log err.message
    process.exit 1
