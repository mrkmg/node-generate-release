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

help_message = '''
generate-release

-p, --package   FILE            Path to package.json file. Default: ./package.json
-c, --current-version VERSION   Current Version. Default: read from package.json
-v, --next-version VERSION      Next Version. Default: automatically bumps
-t, --release-type TYPE         Release Type: patch, minor, major. Ignored when next-version is given. Default: prompt, if next-version is undefined
-n, --no-confirm                Do not ask for confirmation. Default: prompt for confirmation
-l, --skip-git-pull             Do not pull from origin and rebase master and dev. Default: Do pull
-s, --skip-git-push             Do not push to origin when complete. Default: Do push
-f, --skip-git-flow-finish      Do not finish git-flow release. Default: Do finish
-d, --release-file FILE         Path to your .release.json file. Default: ./.release.json
-o, --remote REMOTE             Change the remote. Default: origin
-q, --quiet                     Less output. Default: Do show output
-m, release-message [MESSAGE]   Set a release message. If no message given, prompt for one. Will replace
                                "{version}" with the next version. Default: Release {version}


'''

describe 'run', ->
  before ->
    @run_arguments = ['node', 'script', '-t', 'patch', '-n', '-l', '-s', '-o', 'test']
    @quiet_run_arguments = ['node', 'script', '-t', 'patch', '-n', '-l', '-s', '-o', 'test', '-q']
    @skip_git_flow_finish_arguments = ['node', 'script', '-t', 'patch', '-n', '-l', '-s', '-f', '-o', 'test']
    @next_version_run_arguments = ['node', 'script', '-t', 'patch', '-n', '-l', '-s', '-v', '2.10.0', '-o', 'test']
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
      tag_message_result = Exec 'git cat-file tag 1.2.4 | tail -n +6'
      branch_check_result = Exec 'git rev-parse --abbrev-ref HEAD'

      assert.equal package_file.version, '1.2.4'
      assert.equal readme_file.toString(), 'TEST FILE\n=========\n\n1.2.4'
      assert.equal tag_check_result.toString(), '1.2.4\n'
      assert.equal tag_message_result.toString(), 'Release 1.2.4\n'
      assert.equal branch_check_result.toString(), 'develop\n'
      assert FS.existsSync "#{@temp_dir}/pre_command"
      assert FS.existsSync "#{@temp_dir}/post_command"
      assert FS.existsSync "#{@temp_dir}/post_complete"
      assert not FS.existsSync "#{@temp_dir}/deleteme"
      assert @exit_stub.calledWith(0)

  it 'Should not output anything with quiet run', ->
    output_spy = Sinon.spy process.stdout, 'write'

    Promise
    .try =>
      main @quiet_run_arguments
    .then ->
      assert not output_spy.called
    .finally ->
      output_spy.restore()

  it 'Should be in release branch when skipped git-flow release finish', ->
    Promise
      .try =>
        main @skip_git_flow_finish_arguments
      .then =>
        package_file = JSON.parse FS.readFileSync "#{@temp_dir}/package.json"
        readme_file = FS.readFileSync "#{@temp_dir}/README.md"
        tag_check_result = Exec 'git tag -l 1.2.4'
        branch_check_result = Exec 'git rev-parse --abbrev-ref HEAD'

        assert.equal package_file.version, '1.2.4'
        assert.equal readme_file.toString(), 'TEST FILE\n=========\n\n1.2.4'
        assert.equal tag_check_result.toString(), ''
        assert.equal branch_check_result.toString(), 'release/1.2.4\n'
        assert @exit_stub.calledWith(0)


  it 'Should have run with given next version correctly', ->
    Promise
      .try =>
        main @next_version_run_arguments
      .then =>
        package_file = JSON.parse FS.readFileSync "#{@temp_dir}/package.json"
        readme_file = FS.readFileSync "#{@temp_dir}/README.md"
        tag_check_result = Exec 'git tag -l 2.10.0'
        tag_message_result = Exec 'git cat-file tag 2.10.0 | tail -n +6'
        branch_check_result = Exec 'git rev-parse --abbrev-ref HEAD'

        assert.equal package_file.version, '2.10.0'
        assert.equal readme_file.toString(), 'TEST FILE\n=========\n\n2.10.0'
        assert.equal tag_check_result.toString(), '2.10.0\n'
        assert.equal tag_message_result.toString(), 'Release 2.10.0\n'
        assert.equal branch_check_result.toString(), 'develop\n'
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
      assert.equal stdout_spy.args[0][0], help_message
      assert @exit_stub.calledWith 0
    .finally ->
      stdout_spy.restore()
