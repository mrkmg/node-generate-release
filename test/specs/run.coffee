###
  Generate Release
  Kevin Gravier
  MIT License
###

Chai = require 'chai'
Sinon = require 'sinon'

Chai.use(require 'chai-as-promised')
assert = Chai.assert

Promise = require 'bluebird'
rmdir = require 'rmdir'
FS = require 'fs'
Temp = require 'temp'
Exec = require('child_process').execSync

setTestRepo = require '../helpers/setupTestRepo'
GitCommands = require '../../src/lib/GitCommands'

main = require '../../src/index'

describe 'run', ->
  before ->
    @starting_debug = process.env.IS_DEBUG
    process.env.IS_DEBUG = true

  beforeEach ->
    @arguments = ['node', 'script', '-t', 'patch', '-n', '-l', '-s', '-o', 'test']
    @starting_dir = process.cwd()
    @temp_dir = Temp.path()

    setTestRepo @temp_dir

  afterEach (cb) ->
    process.chdir @starting_dir
    rmdir @temp_dir, cb

  after ->
    process.env.IS_DEBUG = @starting_debug

  it 'Should run correctly', ->
    Promise
    .try =>
      main @arguments
    .then =>
      package_file = JSON.parse FS.readFileSync "#{@temp_dir}/package.json"
      readme_file = FS.readFileSync "#{@temp_dir}/README.md"
      tag_check_result = Exec 'git tag -l 1.2.4'

      assert.equal package_file.version, '1.2.4'
      assert.equal readme_file.toString(), 'test repo\n1.2.4\n'
      assert.equal tag_check_result.toString(), '1.2.4\n'
      assert FS.existsSync "#{@temp_dir}/pre_command"
      assert FS.existsSync "#{@temp_dir}/post_command"
      assert FS.existsSync "#{@temp_dir}/post_complete"

  it 'Should reset on command failure', ->
    commit_stub = Sinon.stub(GitCommands.prototype, 'commit').throws()
    reset_spy = Sinon.spy(GitCommands.prototype, 'reset')
    exit_stub = Sinon.stub(process, 'exit', -> 0)

    Promise
    .try =>
      main @arguments
    .catch -> true #throw away error, we expect it.
    .then =>
      assert reset_spy.called
      assert exit_stub.calledWith(1)
    .finally ->
      exit_stub.restore()
      commit_stub.restore()
      reset_spy.restore()





