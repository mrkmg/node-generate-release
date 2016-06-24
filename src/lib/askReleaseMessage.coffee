###
  Generate Release
  Kevin Gravier
  MIT License
###

Inquirer = require 'inquirer'

module.exports = () ->
  args =
    type: 'list'
    name: 'release'
    message: 'Release Message?'
    default: 'patch'
    choices: ['patch', 'minor', 'major']

  Inquirer.prompt [args]
  .then (result) ->
    result.release
