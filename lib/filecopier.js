'use strict';

var extname = require('path').extname;
var through = require('through');
var filesUtils = require('./utils-files');

// debug modules
var debug = require('debug')('transforms:filecopier');
var inspect = require('util').inspect;

module.exports = function(file, options) {

  var text = [];
  var mapping;

  debug('options: %s', inspect(options));

  return through(write, end);

  function write(chunk) {
    text.push(chunk);
  }

  function end() {
    var that = this;
    text = Buffer.concat(text).toString('utf8');
    mapping = filesUtils.getMapping(text);

    if (!mapping) {
      // extname valid, but not a file mapping json file
      this.queue(text);
      return this.queue(null);
    }

    // move the files based files mapping

    filesUtils.moveFiles(
      mapping.list,
      {imgDir: options.imgDir, from: file},
      function(err) {
        if (err) return that.emit('error', err);
        that.queue(null);
      }
    );

  }
};