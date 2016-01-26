###
  Generate Release
  Kevin Gravier
  MIT License
###

Inquirer = require 'inquirer'
Promise = require 'bluebird'

module.exports = () ->
  args =
    type: 'list'
    name: 'release'
    message: 'Release Type?'
    default: 'patch'
    choices: ['patch', 'minor', 'major']

  new Promise (resolve) ->
    Inquirer.prompt [args], (answers) ->
      resolve answers.release
