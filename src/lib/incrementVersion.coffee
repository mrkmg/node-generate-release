###
  Generate Release
  Kevin Gravier
  MIT License
###

module.exports = (version, type) ->
  version_split = version.split('.').map (t) -> parseInt t

  switch type
    when 'patch'
      version_split[2]++
    when 'minor'
      version_split[1]++
      version_split[2] = 0
    when 'major'
      version_split[0]++
      version_split[1] = 0
      version_split[2] = 0
    else
      console.log 'Unknown Bump Type'
      process.exit 1

  version_split.join '.'
