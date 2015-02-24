/*
 * grunt-asset-version-yaml
 * https://github.com/mayank/grunt-asset-version-yaml
 *
 */

'use strict';

var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , yaml = require('js-yaml');

module.exports = function(grunt) {

  grunt.registerMultiTask('asset_version_yaml', 'Rename assets files with hash and store hashes in a YAML file', function() {

    var dest = this.data.dest
      , options = this.options({
          encoding: 'utf8',
          algorithm: 'md5',
          format: true,
          length: 4,
          rename: false
        });

    this.files.forEach(function(files) {

      files.src.forEach(function (file) {

        if (file.length === 0) {
          grunt.log.warn('src does not exist');
          return false;
        }

        if ( ! fs.existsSync(dest)) {
          grunt.log.warn(dest + ' does not exist.');
          return false;
        }

        var basename = path.basename
          , name = basename(file)
          , content = yaml.load(file)
          , hash = crypto.createHash(options.algorithm).update(content, options.encoding).digest('hex')
          , jsoncontent
          , suffix = hash.slice(0, options.length)
          , ext = path.extname(file)
          , newName = options.format ? [suffix, basename(file, ext), ext.slice(1)].join('.') : [basename(file, ext), suffix, ext.slice(1)].join('.');

        // Copy/rename file base on hash and format
        var resultPath = path.resolve(path.dirname(file), newName);
        if (options.rename) {
          fs.renameSync(file, resultPath);
        } else {
          grunt.file.copy(file, resultPath);
        }
        grunt.log.writeln('  ' + file.grey + (' changed to ') + newName.green);

        // Write new hashes to revs/hashes tracking YAML file
        jsoncontent = grunt.file.readJSON(dest);
        jsoncontent[file] = suffix;
        yaml.dump(JSON.stringify(jsoncontent, null, 2));
        grunt.log.writeln('  ' + dest.grey + (' updated hash: ') + suffix.green);
      });
    });
  });
};
