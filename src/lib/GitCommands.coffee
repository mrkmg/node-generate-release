###
  Generate Release
  Kevin Gravier
  MIT License
###

ParseSpawnArgs = require 'parse-spawn-args'
SpawnSync = require('child_process').spawnSync
Exec = require('child_process').execSync

env = process.env
env.GIT_MERGE_AUTOEDIT = 'no'


GIT_CLEAN_REGEX = /^nothing to commit, working directory clean$/m

class GitCommands
  @checkForCleanWorkingDirectory: ->
    status_result = Exec 'git status', {env: env}
    unless GIT_CLEAN_REGEX.test status_result.toString()
      throw new Error 'Working directory is not clean, not ready for release'

  master_branch: 'master'
  develop_branch: 'develop'
  current_version: undefined
  next_version: undefined

  constructor: (opts) ->
    if opts.master_branch? then @master_branch = opts.master_branch
    if opts.develop_branch? then @develop_branch = opts.develop_branch
    if opts.current_version? then @current_version = opts.current_version
    if opts.next_version? then @next_version = opts.next_version

    unless @current_version then throw new Error 'Current Version is not set'
    unless @next_version then throw new Error 'New Version is not set'

  exec: (full_command) ->
    command_array = ParseSpawnArgs.parse full_command
    command = command_array.shift()

    result = SpawnSync command, command_array, {env: env, stdio: 'pipe'}

    unless result.status is 0
      throw new Error "#{full_command} returned #{result.status}. \n\n Output: \n\n #{result.stderr}"

  pull: =>
    @exec 'git fetch'
    @exec "git checkout #{@develop_branch}"
    @exec "git pull origin #{@develop_branch} --rebase"
    @exec "git checkout #{@master_branch}"
    @exec "git reset --hard origin/#{@master_branch}"

  push: =>
    @exec "git push origin #{@develop_branch}"
    @exec "git push origin #{@master_branch}"
    @exec 'git push origin --tags'

  reset: =>
    @exec "git checkout #{@develop_branch}"
    @exec 'git reset --hard HEAD'
    @exec "git branch -D release/#{@next_version}"

  start: =>
    @exec "git checkout #{@develop_branch}"
    @exec "git flow release start #{@next_version}"

  commit: (files) =>
    @exec "git add #{file}" for file in files
    @exec "git commit -am \"Release #{@next_version}\""

  finish: =>
    @exec "git flow release finish -m \"#{@next_version}\" #{@next_version}"


module.exports = GitCommands
