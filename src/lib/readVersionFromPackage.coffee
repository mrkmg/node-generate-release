###
  Generate Release
  Kevin Gravier
  MIT License
###

module.exports = (package_file_location) ->
  version = require(package_file_location).version
  unless version
    throw new Error "Could not read current version from package file: #{package_file_location}"
  version
