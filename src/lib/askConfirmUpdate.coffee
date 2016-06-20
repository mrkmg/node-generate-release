###
  Generate Release
  Kevin Gravier
  MIT License
###

Inquirer = require 'inquirer'

module.exports = (current_version, new_version) ->
  args =
    type: 'confirm'
    name: 'confirm'
    message: "Are you sure you want to update the release from #{current_version} to #{new_version}"

  Inquirer.prompt args
  .then (result) ->
    result.confirm
