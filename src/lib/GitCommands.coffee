###
  Generate Release
  Kevin Gravier
  MIT License
###

Exec = require('child_process').execSync

module.exports.checkForCleanWorkingDirectory = ->
  status_result = Exec 'git status', process.env
  unless /^nothing to commit, working directory clean$/m.test status_result.toString()
    throw new Error 'Working directory is not clean, not ready for release'

module.exports.preCommands = (new_version, skip_pull) ->
  opts =
    env: process.env

  unless skip_pull
    Exec 'git fetch', opts
    Exec 'git checkout develop', opts
    Exec 'git pull origin develop --rebase', opts
    Exec 'git checkout master', opts
    Exec 'git reset --hard origin/master', opts

  Exec 'git checkout develop', opts
  Exec "git flow release start #{new_version}", opts

module.exports.postCommands = (new_version, files, skip_push) ->
  opts =
    env: process.env

  opts.env.GIT_MERGE_AUTOEDIT = 'no'

  Exec "git add #{file}" for file in files
  Exec "git commit -am \"Release #{new_version}\"", opts
  Exec "git flow release finish -m \"#{new_version}\" #{new_version}", opts

  unless skip_push
    Exec 'git push origin develop', opts
    Exec 'git push origin master', opts
    Exec 'git push origin --tags', opts
