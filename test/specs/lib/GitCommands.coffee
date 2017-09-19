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

GitCommands = require '../../../src/lib/GitCommands'

describe 'GitCommands', ->
  before ->
    @settings =
      master_branch: 'test_master_branch'
      develop_branch: 'test_develop_branch'
      remote: 'test_remote'
      current_version: 'test_current_version'
      next_version: 'test_next_version'
      release_message: 'test_release_message'

    @spawnSync = Sinon.stub(ChildProcess, 'spawnSync').callsFake( -> status: 0)

  beforeEach ->
    @git_commands = new GitCommands @settings

  afterEach ->
    @spawnSync.resetHistory()

  after ->
    @spawnSync.restore()

  it 'pull', ->
    @git_commands.pull()

    assert.deepEqual @spawnSync.args[0][1], ['fetch', 'test_remote']
    assert.deepEqual @spawnSync.args[1][1], ['checkout', 'test_develop_branch']
    assert.deepEqual @spawnSync.args[2][1], ['pull', 'test_remote', 'test_develop_branch', '--rebase']
    assert.deepEqual @spawnSync.args[3][1], ['checkout', 'test_master_branch']
    assert.deepEqual @spawnSync.args[4][1], ['reset', '--hard', 'test_remote/test_master_branch']

  it 'push', ->
    @git_commands.push()
    assert.deepEqual @spawnSync.args[0][1], ['push', 'test_remote', 'test_develop_branch']
    assert.deepEqual @spawnSync.args[1][1], ['push', 'test_remote', 'test_master_branch']
    assert.deepEqual @spawnSync.args[2][1], ['push', 'test_remote', '--tags']

  it 'reset', ->
    @git_commands.reset()
    assert.deepEqual @spawnSync.args[0][1], ['checkout', 'test_develop_branch']
    assert.deepEqual @spawnSync.args[1][1], ['reset', '--hard', 'HEAD']
    assert.deepEqual @spawnSync.args[2][1], ['branch', '-D', 'release/test_next_version']

  it 'start', ->
    @git_commands.start()
    assert.deepEqual @spawnSync.args[0][1], ['checkout', 'test_develop_branch']
    assert.deepEqual @spawnSync.args[1][1], ['flow', 'release', 'start', 'test_next_version']

  it 'commit', ->
    @git_commands.commit(['test_file'])
    assert.deepEqual @spawnSync.args[1][1], ['add', 'test_file']
    assert.deepEqual @spawnSync.args[2][1], ['commit', '-m', 'test_release_message']

  it 'finish', ->
    @git_commands.is_avh = false
    @git_commands.finish()
    assert.deepEqual @spawnSync.args[0][1], ['flow', 'release', 'finish', '-m', 'test_release_message', 'test_next_version']
