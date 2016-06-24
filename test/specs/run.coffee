###
  Generate Release
  Kevin Gravier
  MIT License
###

Chai = require 'chai'

Chai.use(require 'chai-as-promised')
assert = Chai.assert

Promise = require 'bluebird'
rmdir = require 'rmdir'
FS = require 'fs'
Temp = require 'temp'
Exec = require('child_process').execSync
main = require '../../src/index'

describe 'run', ->
  starting_dir = process.cwd()
  temp_dir = Temp.path()

  before (cb) ->
    Exec "git clone https://github.com/mrkmg/node-generate-release-test-repo.git #{temp_dir}", stdio: 'pipe'
    process.chdir temp_dir
    Exec "git flow init -d", stdio: 'pipe'
    Promise
    .try ->
      process.env.IS_DEBUG = true
      main ['node', 'script', '-t', 'patch', '-n', '-l', '-s']
    .then -> cb()

  after (cb) ->
    process.chdir starting_dir
    rmdir temp_dir, cb

  it 'should have incremented version in package file', ->
    package_file = JSON.parse FS.readFileSync "#{temp_dir}/package.json"
    assert.equal package_file.version, '1.2.4'

  it 'should have incremented version in readme file', ->
    readme_file = FS.readFileSync "#{temp_dir}/README.md"
    assert.equal readme_file.toString(), 'test repo\n1.2.4\n'

  it 'should have created a tag a release', ->
    tag_check_result = Exec 'git tag -l 1.2.4'
    assert.equal tag_check_result.toString(), '1.2.4\n'

  it 'should have created "pre_command" file', ->
    assert FS.existsSync "#{temp_dir}/pre_command"

  it 'should have created "post_command" file', ->
    assert FS.existsSync "#{temp_dir}/post_command"

  it 'should have created "post_complete" file', ->
    assert FS.existsSync "#{temp_dir}/post_complete"
    
  it 'should have used the custom release message'



