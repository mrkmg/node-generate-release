###
  Generate Release
  Kevin Gravier
  MIT License
###

Exec = require('child_process').execSync

opts =
  env: process.env

opts.env.GIT_MERGE_AUTOEDIT = 'no'

GIT_CLEAN_REGEX = /^nothing to commit, working directory clean$/m

module.exports.checkForCleanWorkingDirectory = ->
  status_result = Exec 'git status', opts
  unless GIT_CLEAN_REGEX.test status_result.toString()
    throw new Error 'Working directory is not clean, not ready for release'

module.exports.preCommands = (new_version, skip_pull, master_branch, develop_branch) ->
  unless skip_pull
    Exec 'git fetch', opts
    Exec "git checkout #{develop_branch}", opts
    Exec "git pull origin #{develop_branch} --rebase", opts
    Exec "git checkout #{master_branch}", opts
    Exec "git reset --hard origin/#{master_branch}", opts

  Exec "git checkout #{develop_branch}", opts
  Exec "git flow release start #{new_version}", opts

module.exports.reset = (new_version, master_branch, develop_branch) ->
  Exec "git checkout #{develop_branch}"
  Exec 'git reset --hard HEAD'
  Exec "git branch -D release/#{new_version}"

module.exports.postCommands = (new_version, files, skip_push, master_branch, develop_branch) ->
  Exec "git add #{file}", opts for file in files
  Exec "git commit -am \"Release #{new_version}\"", opts
  Exec "git flow release finish -m \"#{new_version}\" #{new_version}", opts

  unless skip_push
    Exec "git push origin #{develop_branch}", opts
    Exec "git push origin #{master_branch}", opts
    Exec 'git push origin --tags', opts
