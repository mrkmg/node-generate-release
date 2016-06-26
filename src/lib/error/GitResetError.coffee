###
  Generate Release
  Kevin Gravier
  MIT License
###

class GitResetError extends Error
  constructor: (@original_error) ->
    if @original_error?
      @message = @original_error.message
    else
      @message = 'Unknown Error, Resetting'

module.exports = GitResetError
