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
    @run_arguments = ['node', 'script', '-t', 'patch', '-n', '-l', '-s', '-o', 'test']
    @help_arguments = ['node', 'script', '-h']

  beforeEach ->
    @exit_stub = Sinon.stub(process, 'exit')
    @starting_dir = process.cwd()
    @temp_dir = Temp.path()

    setTestRepo @temp_dir

  afterEach (cb) ->
    @exit_stub.restore()
    process.chdir @starting_dir
    rmdir @temp_dir, cb

  it 'Should run correctly', ->
    Promise
    .try =>
      main @run_arguments
    .then =>
      package_file = JSON.parse FS.readFileSync "#{@temp_dir}/package.json"
      readme_file = FS.readFileSync "#{@temp_dir}/README.md"
      tag_check_result = Exec 'git tag -l 1.2.4'
      tag_message_result = Exec 'git --no-pager log -1 --decorate=short --format=\%B 1.2.4'

      assert.equal package_file.version, '1.2.4'
      assert.equal readme_file.toString(), 'TEST FILE\n=========\n\n1.2.4'
      assert.equal tag_check_result.toString(), '1.2.4\n'
      assert.equal tag_message_result.toString(), 'Release 1.2.4\n\n'
      assert FS.existsSync "#{@temp_dir}/pre_command"
      assert FS.existsSync "#{@temp_dir}/post_command"
      assert FS.existsSync "#{@temp_dir}/post_complete"
      assert not FS.existsSync "#{@temp_dir}/deleteme"
      assert @exit_stub.calledWith(0)

  it 'Should reset on command failure', ->
    commit_stub = Sinon.stub(GitCommands.prototype, 'commit').throws()
    reset_spy = Sinon.spy(GitCommands.prototype, 'reset')

    Promise
    .try =>
      main @run_arguments
    .catch -> true #throw away error, we expect it.
    .then =>
      assert reset_spy.called
      assert @exit_stub.calledWith(1)
    .finally ->
      commit_stub.restore()
      reset_spy.restore()

  it 'Should show help', ->
    stdout_spy = Sinon.spy(process.stdout, 'write')

    Promise
    .try =>
      main @help_arguments
    .then =>
      assert stdout_spy.calledWith('generate-release\n\n-p, --package              Path to package.json file. Default: ./package.json\n-c, --current-version      Current Version. Default: read from package.json\n-t, --release-type         Release Type: patch, minor, major. Default: prompt\n-n, --no-confirm           Do not ask for confirmation. Default: prompt for confirmation\n-l, --skip-git-pull        Do not pull from origin and rebase master and dev. Default: Do pull\n-s, --skip-git-push        Do not push to origin when complete. Default: Do push\n-d, --release-file         Path to your .release.json file. Default: ./.release.json\n-m, --set-release-message  Prompt to write a release message. Default: Release {version}\n-o, --remote               Change the remote. Default: origin\n\n\n')
      assert @exit_stub.calledWith(0)
    .finally ->
      stdout_spy.restore()
