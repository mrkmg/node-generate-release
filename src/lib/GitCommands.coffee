###
  Generate Release
  Kevin Gravier
  MIT License
###

FS = require 'fs'
ChildProcess = require 'child_process'
Temp = require 'temp'

env = process.env
env.GIT_MERGE_AUTOEDIT = 'no'

GIT_CLEAN_REGEX = /^nothing to commit,? \(?working (directory|tree) clean\)?$/m
AVH_EDITION_REGEX = /AVH Edition/

class GitCommands
  @checkForCleanWorkingDirectory: ->
    status_result = ChildProcess.execSync 'git status', {env: env}
    unless GIT_CLEAN_REGEX.test status_result.toString()
      throw new Error 'Working directory is not clean, not ready for release'

  @isAvhEdition: ->
    version_result = ChildProcess.execSync 'git flow version', {env: env}
    AVH_EDITION_REGEX.test version_result


  master_branch: 'master'
  develop_branch: 'develop'
  release_branch: undefined
  remote: 'origin'
  current_version: undefined
  next_version: undefined
  release_message: undefined
  skip_git_flow_finish: false
  is_avh: false

  constructor: (opts) ->
    @master_branch = opts.master_branch               if opts.master_branch?
    @develop_branch = opts.develop_branch             if opts.develop_branch?
    @current_version = opts.current_version           if opts.current_version?
    @next_version = opts.next_version                 if opts.next_version?
    @release_message = opts.release_message           if opts.release_message?
    @remote = opts.remote                             if opts.remote?
    @skip_git_flow_finish = opts.skip_git_flow_finish  if opts.skip_git_flow_finish?

    @release_branch = "release/#{@next_version}"

    @is_avh = GitCommands.isAvhEdition()

    unless @current_version then throw new Error 'Current Version is not set'
    unless @next_version then throw new Error 'New Version is not set'

  git: (args...) ->
    result = ChildProcess.spawnSync 'git', args, {env: env, stdio: 'pipe'}

    unless result.status is 0
      throw new Error "git #{args.join(' ')} returned #{result.status}. \n\n Output: \n\n #{result.stderr}"

    if result.stdout
      result.stdout.toString()
    else
      ''

  pull: =>
    @git 'fetch', @remote
    @git 'checkout', @develop_branch
    @git 'pull', @remote, @develop_branch, '--rebase'
    @git 'checkout', @master_branch
    @git 'reset', '--hard', "#{@remote}/#{@master_branch}"

  push: =>
    unless @skip_git_flow_finish
      @git 'push', @remote, @develop_branch
      @git 'push', @remote, @master_branch
      @git 'push', @remote, '--tags'
    else
      @git 'push', '-u', @remote, @release_branch

  reset: =>
    @git 'checkout', @develop_branch
    @git 'reset', '--hard', 'HEAD'
    @git 'branch', '-D', "release/#{@next_version}"

  start: =>
    @git 'checkout', @develop_branch
    @git 'flow', 'release', 'start', @next_version

  addDeletedFiles: =>
    files = @git('ls-files', '--deleted').split '\n'
    @git 'rm', '--cached', file for file in files when file isnt ''

  commit: (files) =>
    @addDeletedFiles()
    @git 'add', file for file in files
    @git 'commit', '-m', @release_message

  finish: =>
    if @is_avh
      @finishAvh()
    else
      @finishNonAvh()

  finishNonAvh: =>
    @git 'flow', 'release', 'finish', '-m', @release_message, @next_version

  finishAvh: =>
    release_message_file = Temp.path()
    FS.writeFileSync release_message_file, @release_message
    @git 'flow', 'release', 'finish', '-f', release_message_file, @next_version
    FS.unlinkSync release_message_file

module.exports = GitCommands
