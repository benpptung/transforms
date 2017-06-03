'use strict';

/**
 * User: benpptung
 * Date: 2014/2/2
 * Time: PM7:51
 */

// modules required
var extname = require('path').extname;
var join = require('path').join;
var util = require('util');
var inspect = util.inspect;
var format = util.format;
var less = require('less');
var sass = require('node-sass');
var stylus = require('stylus');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer-core');
var colors = require('colors');
var debug = require('debug')('transforms:utils');
var CleanCSS = require('clean-css');


exports.cssTransform = function (codes, options, callback) {
  var autoprefixer = options.autoprefixer;

  exports.cssByContent(codes, options, fn1);

  function fn1(err, codes) {
    if (err) return callback(err);
    if (!autoprefixer) callback(null, codes);
    exports.autoprefixer(codes, autoprefixer, fn2);
  }

  function fn2(err, codes) {
    if (err) return callback(err);
    exports.cleanCSS(codes, callback);
  }

};

exports.autoprefixer = function (codes, options, callback) {

  if (typeof options == 'string' || Array.isArray(options)) {
    try {
      // codes = autoprefixer({browsers: options, cascade: config.beautify}).process(codes).css;
      // since autoperfixer 5.2.0
      postcss([autoprefixer({browsers: options, cascade: true})])
        .process(codes)
        .then(function(result) {
          callback(null, result.css);
        });
    } catch (err) { callback(err); }

    return; // since autoprefixer 5.2.0
  }
  return callback(null, codes);
};



exports.cssByContent = function (content, options, callback) {


  if (!options ||
    typeof options != 'object' ||
    typeof options.filename != 'string' ||
    !Array.isArray(options.paths) ||
    options.paths.length == 0 ||
    typeof options.paths[0] != 'string') {
    return callback(new TypeError(format('invalid options %s', inspect(options))));
  }
  if (content == '') content = ' '; /// avoid empty string error

  var paths = options.paths;
  var filename = options.filename;

  paths.push(join(process.cwd(), 'node_modules'));

  var ext = extname(filename);
  switch (ext) {
    case '.less':
      less.render(
        content,
        {paths: paths, filename: filename},
        function (err, res) {
          callback(err, res.css);
        });
      return;

    case '.scss':
      return exports.sassRender(content, paths, callback);

    case '.styl':
      stylus(content)
        .set('filename', filename)
        .set('paths', paths)
        .render(callback);
      return;

    default:
      return callback(null, content);
  }

};


/**
 *
 * @param {String} content
 * @param {Array} includes
 * @param {Function} callback
 */
exports.sassRender = function (content, includes, callback) {

  sass.render({
    data: content,
    includePaths: includes,
    outputStyle: 'expanded'
  }, function(err, res) {
    if (err) return callback(err);
    callback(null, res.css.toString('utf8'));
  });
};

exports.cleanCSS = function(codes, callback) {

  // fork from appstackr,
  // consider this is a transformer for node module, no `config.beautify` need
  // just minify
  try {

    codes = (new CleanCSS({
      keepSpecialComments: 0,
      processImport: false,
      rebase: true
    })).minify(codes).styles;

    callback(null, codes);

  } catch (err) {

    callback(err);
  }
};