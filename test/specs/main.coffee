###
  Generate Release
  Kevin Gravier
  MIT License
###

FS = require 'fs'
Promise = require 'bluebird'
Chai = require 'chai'

Chai.use(require 'chai-as-promised')
assert = Chai.assert

describe 'MAIN', ->
  it 'test runner should pass this always', ->
    assert.ok true
