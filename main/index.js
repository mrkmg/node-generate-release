// Generated by CoffeeScript 1.10.0

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var Exec, FS, Inquirer, Minimist, Path, Promise, bumpVersion, confirmUpdate, getBumpType, getCurrentVersion, postGitCommands, preGitCommands, writeNewVersionPackage, writeNewVersionToReadme;

  Inquirer = require('inquirer');

  Promise = require('bluebird');

  FS = require('fs');

  Exec = require('child_process').execSync;

  Path = require('path');

  Minimist = require('minimist');

  getCurrentVersion = function(package_path) {
    var version;
    version = require(Path.resolve(package_path)).version;
    if (!version) {
      throw new Error('Could not read current version');
    }
    return version;
  };

  getBumpType = function() {
    var args;
    args = {
      type: 'list',
      name: 'release',
      message: 'Release Type?',
      "default": 'patch',
      choices: ['patch', 'minor', 'major']
    };
    return new Promise(function(resolve) {
      return Inquirer.prompt([args], function(answers) {
        return resolve(answers.release);
      });
    });
  };

  bumpVersion = function(version, bump) {
    var version_split;
    version_split = version.split('.').map(function(t) {
      return parseInt(t);
    });
    switch (bump) {
      case 'patch':
        version_split[2]++;
        break;
      case 'minor':
        version_split[1]++;
        version_split[2] = 0;
        break;
      case 'major':
        version_split[0]++;
        version_split[1] = 0;
        version_split[2] = 0;
        break;
      default:
        console.log('Unknown Bump Type');
        process.exit(1);
    }
    return version_split.join('.');
  };

  confirmUpdate = function(current_version, new_version) {
    var args;
    args = {
      type: 'confirm',
      name: 'confirm',
      message: "Are you sure you want to update the release from " + current_version + " to " + new_version
    };
    return new Promise(function(resolve) {
      return Inquirer.prompt(args, function(answers) {
        return resolve(answers.confirm);
      });
    });
  };

  writeNewVersionToReadme = function(readme_path, current_version, new_version) {
    var file, new_file, real_path;
    real_path = path.resolve(readme_path);
    file = FS.readFileSync(real_path);
    new_file = file.toString().replace(current_version, new_version);
    return FS.writeFileSync(real_path, new_file, 'utf8');
  };

  writeNewVersionPackage = function(package_path, current_version, new_version) {
    var pack, real_path;
    real_path = path.resolve(package_path);
    pack = require(real_path);
    pack.version = new_version;
    return FS.writeFileSync(real_path, JSON.stringify(pack, null, 2) + '\n', 'utf8');
  };

  preGitCommands = function() {
    var opts;
    opts = {
      env: process.env
    };
    Exec('git fetch', opts);
    Exec('git checkout develop', opts);
    Exec('git pull origin develop --rebase', opts);
    Exec('git checkout master', opts);
    Exec('git reset --hard origin/master', opts);
    Exec('git checkout develop', opts);
    return Exec("git flow release start " + new_version, opts);
  };

  postGitCommands = function() {
    var opts;
    opts = {
      env: process.env
    };
    opts.env.GIT_MERGE_AUTOEDIT = 'no';
    Exec('git add README.md package.json', opts);
    Exec('git commit -am "Release ' + new_version + '"', opts);
    Exec('git flow release finish -m "' + new_version + '" ' + new_version, opts);
    Exec('git push origin develop', opts);
    Exec('git push origin master', opts);
    return Exec('git push origin --tags', opts);
  };

  module.exports = function(args) {
    var bump_type, current_version, new_version, options;
    current_version = '0.0.0';
    new_version = '9.9.9';
    bump_type = 'patch';
    options = {};
    return Promise["try"](function() {
      return args.slice(2);
    }).then(Minimist).then(function(args) {
      options = args;
      if (options.p == null) {
        options.p = './package.json';
      }
      if (options.m == null) {
        return options.m = './README.md';
      }
    }).then(function() {
      return getCurrentVersion(options.p);
    }).then(function(version) {
      return current_version = version;
    }).then(function() {
      if (options.r != null) {
        return options.r;
      } else {
        return getBumpType();
      }
    }).then(function(type) {
      return bump_type = type;
    }).then(function() {
      return bumpVersion(current_version, bump_type);
    }).then(function(version) {
      return new_version = version;
    }).then(function() {
      if (options.n != null) {
        return true;
      } else {
        return confirmUpdate(current_version, new_version);
      }
    }).then(function(do_update) {
      if (!do_update) {
        throw new Error('Update Canceled');
      }
    }).then(function() {
      throw new Error('NO');
    }).then(preGitCommands).then(function() {
      return writeNewVersionToReadme(options.p, current_version, new_version);
    }).then(function() {
      return writeNewVersionPackage(options.m, current_version, new_version);
    }).then(postGitCommands)["catch"](function(err) {
      console.log(err.message);
      return process.exit(1);
    });
  };

}).call(this);
