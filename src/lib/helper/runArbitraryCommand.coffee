###
  Generate Release
  Kevin Gravier
  MIT License
###

SpawnSync = require('child_process').spawnSync

module.exports = (command_string) ->
  ret = SpawnSync 'sh', ['-c', command_string], stdio: 'pipe'

  if ret.error
    throw ret.error

  if ret.status isnt 0
    throw new Error "`#{command_string}` returned #{ret.status}. \n\n #{ret.output.toString()}"
