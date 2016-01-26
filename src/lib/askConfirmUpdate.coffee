###
  Generate Release
  Kevin Gravier
  MIT License
###

Inquirer = require 'inquirer'
Promise = require 'bluebird'

module.exports = (current_version, new_version) ->
  args =
    type: 'confirm'
    name: 'confirm'
    message: "Are you sure you want to update the release from #{current_version} to #{new_version}"

  new Promise (resolve) ->
    Inquirer.prompt args, (answers) ->
      resolve answers.confirm
