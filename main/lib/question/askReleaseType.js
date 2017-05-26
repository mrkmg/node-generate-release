// Generated by CoffeeScript 1.12.6

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var Inquirer;

  Inquirer = require('inquirer');

  module.exports = function() {
    var args;
    args = {
      type: 'list',
      name: 'release',
      message: 'Release Type?',
      "default": 'patch',
      choices: ['patch', 'minor', 'major']
    };
    return Inquirer.prompt([args]).then(function(result) {
      return result.release;
    });
  };

}).call(this);
