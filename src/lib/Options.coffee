###
  Generate Release
  Kevin Gravier
  MIT License
###

existsSync = require 'exists-sync'
Path = require 'path'
Minimist = require 'minimist'
extend = require 'xtend'

options =
  show_help:
    default: false
    switches: ['h', 'help']
    file_key: false
    validate: (input) -> typeof input is 'boolean'
  quiet:
    default: false
    switches: ['q', 'quiet']
    file_key: false
    validate: (input) -> typeof input is 'boolean'
  package_file_location:
    default: './package.json'
    switches: ['p', 'package']
    file_key: 'package_file_location'
    filter: (input) -> Path.resolve input
    validate: (input) -> typeof input is 'string' and existsSync(input)
  dot_release_file_location:
    default: './.release.json'
    switches: ['d', 'release-file']
    file_key: false
    filter: (input) -> Path.resolve input
    validate: (input) -> typeof input is 'string'
  no_confirm:
    default: false
    switches: ['n', 'no-confirm']
    file_key: 'no_confirm'
    validate: (input) -> typeof input is 'boolean'
  release_type:
    default: null
    switches: ['t', 'release-type']
    file_key: 'release_type'
    validate: (input) -> input is null or (typeof input is 'string' and input in ['patch', 'minor', 'major'])
  current_version:
    default: null
    switches: ['c', 'current-version']
    file_key: false
    validate: (input) -> input is null or typeof input is 'string'
  remote:
    default: 'origin'
    switches: ['o', 'remote']
    file_key: 'remote'
    validate: (input) -> typeof input is 'string'
  skip_git_pull:
    default: false
    switches: ['l', 'skip-git-pull']
    file_key: 'skip_git_pull'
    validate: (input) -> typeof input is 'boolean'
  skip_git_push:
    default: false
    switches: ['s', 'skip-git-push']
    file_key: 'skip_git_push'
    validate: (input) -> typeof input is 'boolean'
  release_message:
    default: 'Release {version}'
    switches: ['m', 'set-release-message']
    file_key: 'release_message'
    filter: (input) -> if input is false then 'Release {version}' else input
    validate: (input) -> input is true or typeof input is 'string'
  pre_commit_commands:
    default: []
    switches: false
    file_key: 'pre_commit_commands'
    validate: (input) -> Array.isArray input
  post_commit_commands:
    default: []
    switches: false
    file_key: 'post_commit_commands'
    validate: (input) -> Array.isArray input
  post_complete_commands:
    default: []
    switches: false
    file_key: 'post_complete_commands'
    validate: (input) -> Array.isArray input
  files_to_version:
    default: ['README.md']
    switches: false
    file_key: 'files_to_version'
    validate: (input) -> Array.isArray input
  files_to_commit:
    default: []
    switches: false
    file_key: 'files_to_commit'
    validate: (input) -> Array.isArray input

class Options
  _file_data: {}

  constructor: (args) ->
    @args = Minimist args.slice 2

    # Get Release File First
    @getOption 'dot_release_file_location', options.dot_release_file_location
    @getOption 'package_file_location', options.package_file_location
    @loadPackageConfig()
    @loadFileData()
    @getAllOptions()

  getAllOptions: ->
    @getOption(key, opts) for key, opts of options

  getOption: (key, opts) ->
    value = undefined

    value = @getSwitchValue(opts.switches) if opts.switches isnt false
    value = @getFileValue(opts.file_key)   if value is undefined and opts.file_key isnt false
    value = opts.default                   if value is undefined
    value = opts.filter value              if opts.filter?

    if opts.validate?
      unless opts.validate value
        throw new Error "Invalid Value for #{key}: #{value}"

    @[key] = value

  loadFileData: ->
    if existsSync @dot_release_file_location
      @_file_data = extend @_file_data, require @dot_release_file_location

  loadPackageConfig: ->
    if existsSync @package_file_location
      package_json = require @package_file_location
      if package_json.config?.generateRelease?
        @_file_data = extend @_file_data, package_json.config.generateRelease

  getFileValue: (key) ->
    if @_file_data[key]? then @_file_data[key]

  getSwitchValue: (switches) ->
    (@args[s] for s in switches when @args[s]?)[0]

module.exports = Options
