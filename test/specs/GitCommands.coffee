###
  Generate Release
  Kevin Gravier
  MIT License
###

Chai = require 'chai'
Sinon = require 'sinon'
ChildProcess = require('child_process')

Chai.use(require 'chai-as-promised')
assert = Chai.assert

GitCommands = require '../../src/lib/GitCommands'

describe 'GitCommands', ->
  before ->
    this.settings =
      master_branch: 'test_master_branch'
      develop_branch: 'test_develop_branch'
      remote: 'test_remote'
      current_version: 'test_current_version'
      next_version: 'test_next_version'
      release_message: 'test_release_message'

    this.spawnSync = Sinon.stub ChildProcess, 'spawnSync', ->
      status: 0

  beforeEach ->
    this.git_commands = new GitCommands this.settings

  afterEach ->
    this.spawnSync.reset()

  after ->
    this.spawnSync.restore()

  it 'pull', ->
    this.git_commands.pull()

    assert.deepEqual this.spawnSync.args[0][1], ['fetch', 'test_remote']
    assert.deepEqual this.spawnSync.args[1][1], ['checkout', 'test_develop_branch']
    assert.deepEqual this.spawnSync.args[2][1], ['pull', 'test_remote', 'test_develop_branch', '--rebase']
    assert.deepEqual this.spawnSync.args[3][1], ['checkout', 'test_master_branch']
    assert.deepEqual this.spawnSync.args[4][1], ['reset', '--hard', 'test_remote/test_master_branch']

  it 'push', ->
    this.git_commands.push()
    assert.deepEqual this.spawnSync.args[0][1], ['push', 'test_remote', 'test_develop_branch']
    assert.deepEqual this.spawnSync.args[1][1], ['push', 'test_remote', 'test_master_branch']
    assert.deepEqual this.spawnSync.args[2][1], ['push', 'test_remote', '--tags']

  it 'reset', ->
    this.git_commands.reset()
    assert.deepEqual this.spawnSync.args[0][1], ['checkout', 'test_develop_branch']
    assert.deepEqual this.spawnSync.args[1][1], ['reset', '--hard', 'HEAD']
    assert.deepEqual this.spawnSync.args[2][1], ['branch', '-D', 'release/test_next_version']

  it 'start', ->
    this.git_commands.start()
    assert.deepEqual this.spawnSync.args[0][1], ['checkout', 'test_develop_branch']
    assert.deepEqual this.spawnSync.args[1][1], ['flow', 'release', 'start', 'test_next_version']

  it 'commit', ->
    this.git_commands.commit(['test_file'])
    assert.deepEqual this.spawnSync.args[0][1], ['add', 'test_file']
    assert.deepEqual this.spawnSync.args[1][1], ['commit', '-m', 'test_release_message']

  it 'finish', ->
    this.git_commands.finish()
    assert.deepEqual this.spawnSync.args[0][1], ['flow', 'release', 'finish', '-m', 'test_release_message', 'test_next_version']
