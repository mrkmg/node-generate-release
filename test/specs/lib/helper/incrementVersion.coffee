###
  Generate Release
  Kevin Gravier
  MIT License
###

Chai = require 'chai'

Chai.use(require 'chai-as-promised')
assert = Chai.assert

incrementVersion = require '../../../../src/lib/helper/incrementVersion'

describe 'incrementVersion', ->
  it 'increment without prefix', ->
    assert.equal incrementVersion('1.2.3', 'patch'), '1.2.4'
    assert.equal incrementVersion('1.2.3', 'minor'), '1.3.0'
    assert.equal incrementVersion('1.2.3', 'major'), '2.0.0'

  it 'increment with prefix', ->
    assert.equal incrementVersion('v1.2.3', 'patch', 'v'), 'v1.2.4'
    assert.equal incrementVersion('v1.2.3', 'minor', 'v'), 'v1.3.0'
    assert.equal incrementVersion('v1.2.3', 'major', 'v'), 'v2.0.0'

  it 'throws on invalid versions', ->
    assert.throws ->
      incrementVersion('1', 'patch')

  it 'throws on unknown bump type', ->
    assert.throws ->
      incrementVersion('1.2.3', 'other')
