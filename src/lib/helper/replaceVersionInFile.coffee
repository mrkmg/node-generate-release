###
  Generate Release
  Kevin Gravier
  MIT License
###

FS = require 'fs'

module.exports = (file_path, current_version, new_version) ->
  FS.writeFileSync file_path, FS.readFileSync(file_path).toString().replace current_version, new_version
