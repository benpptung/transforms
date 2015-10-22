'use strict';

var path = require('path');
var join = path.join;
var resolve = path.resolve;
var dirname = path.dirname;
var extname = path.extname;
var relative = path.relative;
var format = require('util').format;
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var glob = require('glob');
// debug tools
var debug = require('debug')('transforms:utils-files');
var colors = require('colors');
var inspect = require('util').inspect;

/**
 * retrieve appstackr config from global
 */
var config = global.appstackr || {};
var imgDir = config.imgDir;
var exts = config.exts;

exports.getConfig = function() {

  debug('globalConfig(): %s', inspect(global.appstackr));
  if (!imgDir || !Array.isArray(exts)) return false;
  return {imgDir: imgDir, exts: exts};
};


exports.getMapping = function(text) {

  var mapping;

  if (typeof text === 'string') {
    try {
      mapping = JSON.parse(text);
    } catch (err) { }
  }

  return exports.isFilesMover(mapping) ? mapping : false;
};

/**
 *
 * @param {object|string} obj
 * @returns {boolean}
 */
exports.isFilesMover = function(obj) {

  return obj === Object(obj) && typeof obj.type === 'string' && obj.type == 'files-mapping'
          && obj.list === Object(obj.list);
};

/**
 *
 * @param {object} files
 * @param {object} options
 * @param callback
 */

exports.moveFiles = function (files, options, callback) {

  debug('moveFiles() options: %s', inspect(options));

  async.each(Object.keys(files), function (src, next) {

    var fromDir = dirname(options.from);
    var _src = resolve(fromDir, src);
    var dest = join(options.imgDir, files[src]);
    var destdir = dirname(dest);

    debug('dest: %s', dest);

    mkdirp(destdir, function(err) {

      if (err) return next(err);

      var readable = fs.createReadStream(_src)
        .on('error', onError(next));
      var writable = fs.createWriteStream(dest)
        .on('error', onError(next))
        .on('finish', function () {
          next();
        });

      readable.pipe(writable);
    });

  }, function(err) {
    callback(err);
  });

  function onError(next) {
    return function(err) {
      next(err);
    }
  }
};

/**
 * return the *.files by patterns array
 * @param {Array} patterns
 * @param {Array} exts
 * @returns {*}
 */
exports.getFileMappingsFiles = function(patterns, exts) {

  exts = exts || exports.getConfig().exts;
  var cwd = process.cwd();

  return patterns.reduce(function(pre, curr) {

    // find the file-mapping files
    var files = glob.sync(curr).filter(function(file) {
      return exts.indexOf(extname(file)) >= 0;
    }).map(function(file){ return join(cwd, file) });

    return pre.concat(files);
  }, []).reduce(function(pre, curr) {

    // remove duplicated files
    if (pre.indexOf(curr) < 0) pre.push(curr);
    return pre;

  }, []);
};

/**
 * return mapping object by *.files
 * @param {array} mappingfiles
 * @return {array}
 */
exports.getMappingSync = function(mappingfiles) {

  return mappingfiles.map(function(from) {

    var mapping;
    try {
      mapping = JSON.parse(fs.readFileSync(from, 'utf8'));
    } catch (er) { throw new Error(format('fail to read or parse: %s', from))}

    if (!exports.isFilesMover(mapping)) throw new TypeError(format('not a mapping file: %s', from));

    mapping.from = from;
    return mapping;

  }).filter(Boolean);

};

/**
 * Return the mapping files for file watcher
 * @param mappings
 */
exports.getMappedFromFiles = function(mappings) {

  return mappings.reduce(function(pre, mapping) {

    var fromDir = dirname(mapping.from);
    var mappeds = Object.keys(mapping.list).map(function(src) {
      return resolve(fromDir, src);
    });
    return pre.concat(mappeds);
  }, []);
};

/**
 *
 * @param {Array} mappings
 * @returns {Array}
 */
exports.getMappedPatterns = function(mappings) {
  var files = exports.getMappedFromFiles(mappings);
  var cwd = process.cwd();

  return files.map(function(file) {
    return relative(cwd, file);
  })
};

/**
 *
 * @param {array} patterns
 * @param {array} [exts]
 * @returns {array}
 */
exports.getMappingByPatterns = function(patterns, exts) {
  var files = exports.getFileMappingsFiles(patterns, exts);
  return exports.getMappingSync(files);
};

/**
 *
 * @param {array} patterns
 * @param {function} callback
 */
/*
exports.getFilesForCopy = function(patterns, callback) {

  var exts = exports.getConfig().exts;

  async.concat(patterns, function(patt, done) {

    glob(patt, function(err, files) {
      if (err) return done(err);

      files = files.filter(function(file) {
        return exts.indexOf(extname(file)) >= 0;
      });

      done(null, files);
    });

  }, function(err, files) {

      async.concat(files, function(file, next) {

        file = join(process.cwd(), file);
        var fromDir = dirname(file);
        var ar = [];

        fs.readFile(file, 'utf8', function(err, move) {

          if (err) return next(err);

          try {
            move = JSON.parse(move);
          } catch (er) { return next(er);}

          if (!exports.isFilesMover(move)) return next(new Error('not filesmove file: ' + file));

          var list = Object.keys(move.list);
          for(var i = 0, len = list.length; i < len; ++i) {
            ar.push(resolve(fromDir, list[i]));
          }

          next(null, ar);
        })

      }, function(err, files) {

        files = files.reduce(function(pre, curr) {
          if (pre.indexOf(curr) < 0) pre.push(curr);
          return pre;
        }, []);

        callback(null, files);
      });
  });
};

/!**
 *
 * @param {array} patterns
 * @param {function} callback
 *!/

exports.getFilesPattern = function(patterns, callback) {

  exports.getFilesForMove(patterns, function(err, files) {
    if (err) return callback(err);

    var cwd = process.cwd();

    var patts = files.map(function(file) {
      return relative(cwd, file);
    });

    callback(null, patts);
  })
};*/
