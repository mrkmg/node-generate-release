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

Options = require './lib/Options'
askReleaseType = require './lib/askReleaseType'
incrementVersion = require './lib/incrementVersion'
askConfirmUpdate = require './lib/askConfirmUpdate'

readVersionFromPackageFile = (package_file_location) ->
  version = require(Path.resolve(package_file_location)).version
  unless version
    throw new Error "Could not read current version from package file: #{package_file_location}"
  version

writeNewVersionToReadme = (readme_path, current_version, new_version) ->
  real_path = Path.resolve readme_path
  file = FS.readFileSync real_path
  new_file = file.toString().replace current_version, new_version
  FS.writeFileSync real_path, new_file, 'utf8'

writeNewVersionPackage = (package_path, current_version, new_version) ->
  pack = require package_path
  pack.version = new_version
  pack_string = JSON.stringify pack, null, 2
  pack_string += '\n'
  FS.writeFileSync package_path, pack_string, 'utf8'

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
  Exec "git commit -am \"Release #{new_version}\"", opts
  Exec "git flow release finish -m \"#{new_version}\" #{new_version}", opts
  Exec 'git push origin develop', opts
  Exec 'git push origin master', opts
  Exec 'git push origin --tags', opts

module.exports = (args) ->
  options = new Options()

  Promise
  .try ->
    args.slice 2
  .then Minimist
  .then (args) ->
    options.parseArgs args

  .then ->
    unless options.release_type
      askReleaseType()
      .then (release_type) ->
        options.release_type = release_type
  .then ->
    unless options.current_version
      options.current_version = readVersionFromPackageFile options.package_file_location
    options.next_version = incrementVersion options.current_version, options.release_type
  .then ->
    options.no_confirm or (askConfirmUpdate options.current_version, options.next_version)
  .then (do_update) ->
    unless do_update
      throw new Error 'Update Canceled'
  .then ->
    preGitCommands options.next_version
  .then ->
    writeNewVersionToReadme options.readme_file_location, options.current_version, options.next_version
  .then ->
    writeNewVersionPackage options.package_file_location, options.current_version, options.next_version
  .then ->
    postGitCommands options.next_version
  .catch (err) ->
    console.log err.message
    process.exit 1
