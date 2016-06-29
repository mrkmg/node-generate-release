Glob = require 'glob'
Path = require 'path'

globNormalize = (params...) ->
  files = []

  for item in params
    if typeof item is 'string'
      files.push Path.resolve file for file in Glob.sync item
    else if Array.isArray item
      files = files.concat globNormalize.apply {}, item
    else
      throw new Error "#{item} is not an array or a string."

  files.sort().filter (item, pos, self) -> not pos or item isnt self[pos - 1]

module.exports = globNormalize
