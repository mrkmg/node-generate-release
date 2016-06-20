###
  Generate Release
  Kevin Gravier
  MIT License
###

Exec = require('child_process').execSync

opts =
  env: process.env
opts.env.GIT_MERGE_AUTOEDIT = 'no'

opts_run =
  env: process.env
  stdio: 'inherit'
opts_run.env.GIT_MERGE_AUTOEDIT = 'no'


GIT_CLEAN_REGEX = /^nothing to commit, working directory clean$/m

module.exports.checkForCleanWorkingDirectory = ->
  status_result = Exec 'git status', opts
  unless GIT_CLEAN_REGEX.test status_result.toString()
    throw new Error 'Working directory is not clean, not ready for release'

module.exports.preCommands = (new_version, skip_pull, master_branch, develop_branch) ->
  unless skip_pull
    Exec 'git fetch', opts_run
    Exec "git checkout #{develop_branch}", opts_run
    Exec "git pull origin #{develop_branch} --rebase", opts_run
    Exec "git checkout #{master_branch}", opts_run
    Exec "git reset --hard origin/#{master_branch}", opts_run

  Exec "git checkout #{develop_branch}", opts_run
  Exec "git flow release start #{new_version}", opts_run

module.exports.reset = (new_version, master_branch, develop_branch) ->
  Exec "git checkout #{develop_branch}", opts_run
  Exec 'git reset --hard HEAD', opts_run
  Exec "git branch -D release/#{new_version}", opts_run

module.exports.postCommands = (new_version, files, skip_push, master_branch, develop_branch) ->
  Exec "git add #{file}", opts_run for file in files
  Exec "git commit -am \"Release #{new_version}\"", opts_run
  Exec "git flow release finish -m \"#{new_version}\" #{new_version}", opts_run

  unless skip_push
    Exec "git push origin #{develop_branch}", opts_run
    Exec "git push origin #{master_branch}", opts_run
    Exec 'git push origin --tags', opts_run
