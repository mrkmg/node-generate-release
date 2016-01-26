###
  Generate Release
  Kevin Gravier
  MIT License
###

Exec = require('child_process').execSync

module.exports.preCommands = (new_version) ->
  opts =
    env: process.env

  Exec 'git fetch', opts
  Exec 'git checkout develop', opts
  Exec 'git pull origin develop --rebase', opts
  Exec 'git checkout master', opts
  Exec 'git reset --hard origin/master', opts
  Exec 'git checkout develop', opts
  Exec "git flow release start #{new_version}", opts

module.exports.postCommands = (new_version) ->
  opts =
    env: process.env

  opts.env.GIT_MERGE_AUTOEDIT = 'no'

  Exec 'git add README.md package.json', opts
  Exec "git commit -am \"Release #{new_version}\"", opts
  Exec "git flow release finish -m \"#{new_version}\" #{new_version}", opts
  Exec 'git push origin develop', opts
  Exec 'git push origin master', opts
  Exec 'git push origin --tags', opts
