###
  Generate Release
  Kevin Gravier
  MIT License
###

Inquirer = require 'inquirer'

informational_message = '''
# Please write your release message above
#
# Any line which starts with "#" will be ignored.
'''

module.exports = (new_version) ->
  args =
    type: 'editor'
    name: 'message'
    message: 'Please write a release message.'
    default: "Release #{new_version}\n\n\n#{informational_message}"
    filter: (result) ->
      result.replace(/^#.*$/gm, '').replace(/\n+$/g, '')
    validate: (result) ->
      if result.length is 0
        'Release message can not be empty.'
      else
        true

  Inquirer.prompt args
  .then (result) ->
    result.message
