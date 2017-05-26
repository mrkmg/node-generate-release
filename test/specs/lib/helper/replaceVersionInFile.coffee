###
  Generate Release
  Kevin Gravier
  MIT License
###

Chai = require 'chai'

Chai.use require 'chai-as-promised'
assert = Chai.assert

Temp = require 'temp'
FS = require 'fs'
replaceVersionInFile = require '../../../../src/lib/helper/replaceVersionInFile'

describe 'replaceVersionInFile', ->
  before ->
    @file_path = Temp.path '.md'

  beforeEach ->
    FS.writeFileSync @file_path, 'abc 1.2.3 abc'

  afterEach ->
    FS.unlinkSync @file_path

  it 'should write new version to readme correctly', ->
    replaceVersionInFile @file_path, '1.2.3', '1.2.4'
    message = FS.readFileSync @file_path
    assert.equal message.toString(), 'abc 1.2.4 abc'
