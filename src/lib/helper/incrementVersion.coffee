###
  Generate Release
  Kevin Gravier
  MIT License
###

VERSION_REGEX = /([0-9]+\.[0-9]+\.[0-9]+)/

module.exports = (version, type) ->
  unless VERSION_REGEX.test version
    throw new Error "Version does not match semver: #{version}"

  version_split = version.match(VERSION_REGEX)[0].split('.').map (t) -> parseInt(t)
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
      throw new Error "Unknown Bump Type: #{type}"

  version_split.join '.'
