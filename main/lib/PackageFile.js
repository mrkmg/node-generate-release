// Generated by CoffeeScript 1.12.6

/*
Generate Release
Kevin Gravier
MIT License
 */

(function() {
  var FS, PackageFile;

  FS = require('fs');

  PackageFile = (function() {
    PackageFile.prototype.package_file_location = null;

    PackageFile.prototype.package_file_data = {};

    function PackageFile(package_file_location) {
      this.package_file_location = package_file_location;
    }

    PackageFile.prototype.load = function() {
      return this.package_file_data = require(this.package_file_location);
    };

    PackageFile.prototype.save = function() {
      var pack_string;
      pack_string = JSON.stringify(this.package_file_data, null, 2);
      pack_string += '\n';
      return FS.writeFileSync(this.package_file_location, pack_string, 'utf8');
    };

    PackageFile.prototype.setVersion = function(value) {
      return this.package_file_data.version = value;
    };

    PackageFile.prototype.getVersion = function() {
      return this.package_file_data.version;
    };

    return PackageFile;

  })();

  module.exports = PackageFile;

}).call(this);
