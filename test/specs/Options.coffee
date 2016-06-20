###
  Generate Release
  Kevin Gravier
  MIT License
###

Chai = require 'chai'

Chai.use(require 'chai-as-promised')
assert = Chai.assert

Path = require 'path'
Minimist = require 'minimist'
Options = require '../../src/lib/Options'

describe 'Options', ->
  starting_dir = process.cwd()

  before ->
    process.chdir './test/fake_repo'

  after ->
    process.chdir starting_dir

  it 'should have default options set properly', ->
    options = new Options()
    options.parseArgs {}

    console.log options

    assert.equal options.readme_file_location, Path.resolve './README.md'
    assert.equal options.package_file_location, Path.resolve './package.json'
    assert.equal options.dot_release_file_location, Path.resolve './.release.json'
    assert.equal options.current_version, null
    assert.equal options.release_type, null
    assert.equal options.no_confirm, false
    assert.equal options.skip_git_pull, false
    assert.equal options.skip_git_push, false


  it 'should parse cli options properly', ->
    options = new Options()

    options.parseArgs Minimist [
      '-r',
      './ALTREADME.md',
      '-p',
      './altpackage.json',
      '-c',
      '1.2.3',
      '-t',
      'patch',
      '-n',
      '-l',
      '-s',
      '-d',
      './alt.release.json'
    ]

    assert.equal options.readme_file_location, Path.resolve './ALTREADME.md'
    assert.equal options.package_file_location, Path.resolve './altpackage.json'
    assert.equal options.dot_release_file_location, Path.resolve './alt.release.json'
    assert.equal options.current_version, '1.2.3'
    assert.equal options.release_type, 'patch'
    assert.equal options.no_confirm, true
    assert.equal options.skip_git_pull, true
    assert.equal options.skip_git_push, true

  it 'should parse release file options correctly', ->
    options = new Options()

    options.parseArgs Minimist ['-d', './all.release.json']

    assert.equal options.readme_file_location, Path.resolve './ALTREADME.md'
    assert.equal options.package_file_location, Path.resolve './altpackage.json'
    assert.equal options.no_confirm, true
    assert.equal options.skip_git_pull, true
    assert.equal options.skip_git_push, true
    assert.sameMembers options.pre_commit_commands, ['test1']
    assert.sameMembers options.post_commit_commands, ['test2']
    assert.sameMembers options.additional_files_to_commit, ['test3']


