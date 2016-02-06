###
Generate Release
Kevin Gravier
MIT License
###

class PackageFile
  package_file_location: null
  package_file_data: {}

  load: (@package_file_location) ->
    @package_file_data = require @package_file_location

  save: ->
    pack_string = JSON.stringify @package_file_data, null, 2
    pack_string += '\n'
    FS.writeFileSync @package_file_location, pack_string, 'utf8'

  setVersion: (value) ->
    @package_file_data.version = value

  getVersion: ->
    @package_file_data.version

module.exports = PackageFile
