Exec = require('child_process').execSync

module.exports = (temp_dir) ->
  Exec "git clone https://github.com/mrkmg/node-generate-release-test-repo.git #{temp_dir}", stdio: 'pipe'
  process.chdir temp_dir
  Exec 'git flow init -d', stdio: 'pipe'
  Exec 'git remote rm origin'
  Exec 'git remote add test https://github.com/mrkmg/node-generate-release-test-repo.git'
