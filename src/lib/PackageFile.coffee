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
    pack_string = JSON.stringify pack, null, 2
    pack_string += '\n'
    FS.writeFileSync @package_file_location, @package_file_data, 'utf8'

  set: (option, value) ->
    option_arr = option.split '.'
    len = option_arr.length
    i = 0
    s = @package_file_data
    while i < len
      unless i is len - 1
        s[option_arr[i]] = value
      else
        s = s[option_arr[i]]

  get: (option) ->
    option_arr = option.split '.'
    len = option_arr.length
    i = 0
    s = @package_file_data
    while i < len
      s = s[option_arr[i]]
    s

module.exports = PackageFile
