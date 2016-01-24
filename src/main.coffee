###
  Generate Release
  Kevin Gravier
  MIT License
###

Inquirer = require 'inquirer'
Promise = require 'bluebird'
FS = require 'fs'
Exec = require('child_process').execSync

getCurrentVersion = ->
  version = require('../../package.json').version
  unless version
    throw new Error 'Could not read current version'

  version

getBumpType = ->
  args =
    type: 'list'
    name: 'release'
    message: 'Release Type?'
    default: 'patch'
    choices: ['patch', 'minor', 'major']

  new Promise (resolve) ->
    Inquirer.prompt [args], (answers) ->
      resolve answers.release

bumpVersion = (version, bump) ->
  version_split = version.split('.').map (t) -> parseInt t

  switch bump
    when 'patch'
      version_split[2]++
    when 'minor'
      version_split[1]++
      version_split[2] = 0
    when 'major'
      version_split[0]++
      version_split[1] = 0
      version_split[2] = 0
    else
      console.log 'Unknown Bump Type'
      process.exit 1

  version_split.join '.'

confirmUpdate = (current_version, new_version) ->
  args =
    type: 'confirm'
    name: 'confirm'
    message: "Are you sure you want to update the release from #{current_version} to #{new_version}"

  new Promise (resolve) ->
    Inquirer.prompt args, (answers) ->
      resolve answers.confirm

writeNewVersionToReadme = (current_version, new_version) ->
  file = FS.readFileSync './README.md'
  new_file = file.toString().replace current_version, new_version
  FS.writeFileSync './README.md', new_file, 'utf8'

writeNewVersionPackage = (current_version, new_version) ->
  pack = require '../../package.json'
  pack.version = new_version
  FS.writeFileSync './package.json', JSON.stringify(pack, null, 2), 'utf8'

module.exports = (args) ->
  current_version = '0.0.0'
  new_version = '9.9.9'
  bump_type = 'patch'

  Promise
  .try getCurrentVersion
  .then (version) ->
    current_version = version
  .then getBumpType
  .then (type) ->
    bump_type = type
  .then ->
    bumpVersion current_version, bump_type
  .then (version) ->
    new_version = version
  .then ->
    confirmUpdate current_version, new_version
  .then (do_update) ->
    unless do_update
      throw new Error 'Update Canceled'
  .then ->
    opts =
      env: process.env

    Exec 'git fetch', opts
    Exec 'git checkout develop', opts
    Exec 'git pull origin develop --rebase', opts
    Exec 'git checkout master', opts
    Exec 'git reset --hard origin/master', opts
    Exec 'git checkout develop', opts
    Exec "git flow release start #{new_version}", opts
  .then ->
    writeNewVersionToReadme current_version, new_version
  .then ->
    writeNewVersionPackage current_version, new_version
  .then ->
    opts =
      env: process.env

    opts.env.GIT_MERGE_AUTOEDIT = 'no'

    Exec 'git add README.md package.json', opts
    Exec 'git commit -am "Release ' + new_version + '"', opts
    Exec 'git flow release finish -m "' + new_version + '" ' + new_version, opts
    Exec 'git push origin develop', opts
    Exec 'git push origin master', opts
    Exec 'git push origin --tags', opts
  .catch (err) ->
    console.log err.message
    process.exit 1
