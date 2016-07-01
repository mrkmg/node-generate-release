###
  Generate Release
  Kevin Gravier
  MIT License
###

SpawnSync = require('child_process').spawnSync

isCommandAvailable = (cmd, opts) ->
  ret = SpawnSync cmd, opts, stdio: 'ignore'
  not ret.error?

runner = (
  if isCommandAvailable 'sh', ['--version']
    ['sh', ['-c']]
  else if isCommandAvailable 'cmd.exe', ['/v']
    ['cmd', ['/s', '/v']]
  else
    throw new Error 'Neither "sh" nor "cmd.exe" is available on your system.'
)

module.exports = (command_string) ->
  ret = SpawnSync runner[0], runner[1].concat([command_string]), stdio: 'pipe'

  if ret.error
    throw ret.error

  if ret.status isnt 0
    throw new Error "`#{command_string}` returned #{ret.status}. \n\n #{ret.output.toString()}"
