Exec = require('child_process').execSync
FS = require('fs')

module.exports = (temp_dir) ->
  FS.mkdirSync temp_dir
  process.chdir temp_dir
  FS.writeFileSync 'package.json', package_json
  FS.writeFileSync 'alt.package.json', package_json
  FS.writeFileSync '.release.json', release_json
  FS.writeFileSync '.alt.release.json', release_json
  FS.writeFileSync '.all.release.json', all_release_json
  FS.writeFileSync 'README.md', readme_md
  FS.writeFileSync 'deleteme', 'testfile'

  Exec 'git init', stdio: 'ignore'
  Exec 'git add -A'
  Exec 'git commit -m "Commit"', stdio: 'pipe'
  Exec 'git flow init -d', stdio: 'ignore'


readme_md = '''
TEST FILE
=========

1.2.3
'''

package_json = '''
{"version":"1.2.3"}
'''

release_json = '''
{
  "pre_commit_commands": ["touch ./pre_command", "rm -f deleteme"],
  "post_commit_commands": ["touch ./post_command"],
  "post_complete_commands": ["touch ./post_complete"]
}
'''

all_release_json = '''
{
  "readme_file_location": "./alt.README.md",
  "package_file_location": "./alt.package.json",
  "no_confirm": true,
  "skip_git_pull": true,
  "skip_git_push": true,
  "pre_commit_commands": ["test1"],
  "post_commit_commands": ["test2"],
  "files_to_commit": ["test3"],
  "files_to_version": ["test5"],
  "release_message": "Testing Message {version}",
  "remote": "test4"
}
'''
