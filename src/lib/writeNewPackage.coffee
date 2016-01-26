###
  Generate Release
  Kevin Gravier
  MIT License
###

FS = require 'fs'

module.exports = (package_path, current_version, new_version) ->
  pack = require package_path
  pack.version = new_version
  pack_string = JSON.stringify pack, null, 2
  pack_string += '\n'
  FS.writeFileSync package_path, pack_string, 'utf8'
