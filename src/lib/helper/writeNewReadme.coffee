###
  Generate Release
  Kevin Gravier
  MIT License
###

FS = require 'fs'

module.exports = (readme_path, current_version, new_version) ->
  file = FS.readFileSync readme_path
  new_file = file.toString().replace current_version, new_version
  FS.writeFileSync readme_path, new_file, 'utf8'
