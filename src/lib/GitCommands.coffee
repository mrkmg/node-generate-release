###
  Generate Release
  Kevin Gravier
  MIT License
###

ChildProcess = require('child_process')

env = process.env
env.GIT_MERGE_AUTOEDIT = 'no'

GIT_CLEAN_REGEX = /^nothing to commit, working directory clean$/m

class GitCommands
  @checkForCleanWorkingDirectory: ->
    status_result = ChildProcess.execSync 'git status', {env: env}
    unless GIT_CLEAN_REGEX.test status_result.toString()
      throw new Error 'Working directory is not clean, not ready for release'

  master_branch: 'master'
  develop_branch: 'develop'
  remote: 'origin'
  current_version: undefined
  next_version: undefined
  release_message: undefined

  constructor: (opts) ->
    if opts.master_branch? then @master_branch = opts.master_branch
    if opts.develop_branch? then @develop_branch = opts.develop_branch
    if opts.current_version? then @current_version = opts.current_version
    if opts.next_version? then @next_version = opts.next_version
    if opts.release_message? then @release_message = opts.release_message
    if opts.remote? then @remote = opts.remote

    unless @current_version then throw new Error 'Current Version is not set'
    unless @next_version then throw new Error 'New Version is not set'

  exec: (args) ->

    result = ChildProcess.spawnSync 'git', args, {env: env, stdio: 'pipe'}

    unless result.status is 0
      throw new Error "#{args.join(' ')} returned #{result.status}. \n\n Output: \n\n #{result.stderr}"

  pull: =>
    @exec ['fetch', @remote]
    @exec ['checkout', @develop_branch]
    @exec ['pull', @remote, @develop_branch, '--rebase']
    @exec ['checkout', @master_branch]
    @exec ['reset', '--hard', "#{@remote}/#{@master_branch}"]

  push: =>
    @exec ['push', @remote, @develop_branch]
    @exec ['push', @remote, @master_branch]
    @exec ['push', @remote, '--tags']

  reset: =>
    @exec ['checkout', @develop_branch]
    @exec ['reset', '--hard', 'HEAD']
    @exec ['branch', '-D', "release/#{@next_version}"]

  start: =>
    @exec ['checkout', @develop_branch]
    @exec ['flow', 'release', 'start', @next_version]

  commit: (files) =>
    @exec ['add', file] for file in files
    @exec ['commit', '-m', @release_message]

  finish: =>
    @exec ['flow', 'release', 'finish', '-m', @release_message, @next_version]


module.exports = GitCommands
