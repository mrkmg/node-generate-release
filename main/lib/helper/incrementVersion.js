// Generated by CoffeeScript 1.12.6

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var VERSION_REGEX;

  VERSION_REGEX = /([0-9]+\.[0-9]+\.[0-9]+)/;

  module.exports = function(version, type) {
    var version_split;
    if (!VERSION_REGEX.test(version)) {
      throw new Error("Version does not match semver: " + version);
    }
    version_split = version.match(VERSION_REGEX)[0].split('.').map(function(t) {
      return parseInt(t);
    });
    switch (type) {
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
        throw new Error("Unknown Bump Type: " + type);
    }
    return version_split.join('.');
  };

}).call(this);
