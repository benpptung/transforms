'use strict';

var extname = require('path').extname;
var through = require('through');
var babelify = require('babelify');

var styles = require('./styles');
var utils = require('./utils');

module.exports = function (file, options) {

    options = options === Object(options) ? options : {};

    // autoprefixer default options
    var autoprefixer;
    if (!options.autoprefixer && options !== false) {
      // default autoprefixer options
      // if options.autoprefixer === false, disable autoprefixer
      autoprefixer = [
        "Android 2.3",
        "Android >= 4",
        "Chrome >= 20",
        "ff >= 24",
        "ie >= 8",
        "iOS >= 6",
        "Opera >= 12",
        "Safari >= 6"
      ];
    }

    // babel default options
    var babel = options.babel || {};

    var babel_extensions = babel.extensions || ['.jsx', '.es', '.es6' , '.js'];
    var babel_transformer = babelify.configure(babel);
    var ext = extname(file);

    if (~['.css', '.scss', '.less', '.styl'].indexOf(ext) !== 0) return styles({ file: file, autoprefixer: autoprefixer });
    if (~babel_extensions.indexOf(ext) !== 0) return babel_transformer(file);
    return through();

};
