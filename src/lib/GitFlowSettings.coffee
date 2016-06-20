###
  Generate Release
  Kevin Gravier
  MIT License
###

Promise = require 'bluebird'
FS = require 'fs'
IniParser = require 'iniparser'

BRANCH_CONFIG = 'gitflow "branch"'
PREFIX_CONFIG = 'gitflow "prefix"'

class GitFlowSettings
  project_path: ''
  master: 'master'
  develop: 'develop'
  version_tag_prefix: ''

  constructor: (@project_path) ->

  getConfigFile: =>
    file = "#{@project_path}/.git/config"

    if not FS.existsSync(file)
      throw new Error "Git Config File is missing: #{file}"

    IniParser.parseSync(file)

  extractGitFlowDataFromIniData: (ini_data) =>
    unless ini_data[BRANCH_CONFIG]? and ini_data[BRANCH_CONFIG]['master']? and ini_data[BRANCH_CONFIG]['develop']?
      throw new Error 'Git config missing git-flow branch configuration'

    unless ini_data[PREFIX_CONFIG]? and ini_data[PREFIX_CONFIG]['versiontag']?
      throw new Error 'Git config missing git-flow prefix configuration'

    @master = ini_data[BRANCH_CONFIG]['master']
    @develop = ini_data[BRANCH_CONFIG]['develop']
    @version_tag_prefix = ini_data[PREFIX_CONFIG]['versiontag']

  parseIni: =>
    Promise
    .try @getConfigFile
    .then @extractGitFlowDataFromIniData


module.exports = GitFlowSettings
