###
  Generate Release
  Kevin Gravier
  MIT License
###

ParseSpawnArgs = require 'parse-spawn-args'
SpawnSync = require('child_process').spawnSync

module.exports = (command_string) ->
  console.log "Running: #{command_string}\n"

  command_array = ParseSpawnArgs.parse command_string
  command = command_array.shift()
  ret = SpawnSync command, command_array, stdio: 'inherit'

  console.log '\n'

  if ret.error
    throw ret.error

  if ret.status isnt 0
    throw new Error "`#{command_string}` returned #{ret.status}. \n\n #{ret.output.toString()}"
