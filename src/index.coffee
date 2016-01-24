###
  Generate Release
  Kevin Gravier
  MIT License
###

Inquirer = require 'inquirer'
Promise = require 'bluebird'
FS = require 'fs'
Exec = require('child_process').execSync
Path = require 'path'
Minimist = require 'minimist'

getCurrentVersion = (package_path) ->
  version = require(Path.resolve(package_path)).version
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

writeNewVersionToReadme = (readme_path, current_version, new_version) ->
  real_path = Path.resolve readme_path
  file = FS.readFileSync real_path
  new_file = file.toString().replace current_version, new_version
  FS.writeFileSync real_path, new_file, 'utf8'

writeNewVersionPackage = (package_path, current_version, new_version) ->
  real_path = Path.resolve package_path
  pack = require real_path
  pack.version = new_version
  FS.writeFileSync real_path, JSON.stringify(pack, null, 2) + '\n', 'utf8'

preGitCommands = (new_version) ->
  opts =
    env: process.env

  Exec 'git fetch', opts
  Exec 'git checkout develop', opts
  Exec 'git pull origin develop --rebase', opts
  Exec 'git checkout master', opts
  Exec 'git reset --hard origin/master', opts
  Exec 'git checkout develop', opts
  Exec "git flow release start #{new_version}", opts

postGitCommands = (new_version) ->
  opts =
    env: process.env

  opts.env.GIT_MERGE_AUTOEDIT = 'no'

  Exec 'git add README.md package.json', opts
  Exec 'git commit -am "Release ' + new_version + '"', opts
  Exec 'git flow release finish -m "' + new_version + '" ' + new_version, opts
  Exec 'git push origin develop', opts
  Exec 'git push origin master', opts
  Exec 'git push origin --tags', opts

module.exports = (args) ->
  current_version = '0.0.0'
  new_version = '9.9.9'
  bump_type = 'patch'

  options = {}

  Promise
  .try ->
    args.slice 2
  .then Minimist
  .then (args) ->
    options = args
    unless options.p?
      options.p = './package.json'
    unless options.m?
      options.m = './README.md'
  .then ->
    getCurrentVersion options.p
  .then (version) ->
    current_version = version
  .then ->
    if options.r?
      options.r
    else
      getBumpType()
  .then (type) ->
    bump_type = type
  .then ->
    bumpVersion current_version, bump_type
  .then (version) ->
    new_version = version
  .then ->
    if options.n?
      true
    else
      confirmUpdate current_version, new_version
  .then (do_update) ->
    unless do_update
      throw new Error 'Update Canceled'
  .then ->
    preGitCommands new_version
  .then ->
    writeNewVersionToReadme options.p, current_version, new_version
  .then ->
    writeNewVersionPackage options.m, current_version, new_version
  .then ->
    postGitCommands new_version
  .catch (err) ->
    console.log err.message
    process.exit 1
