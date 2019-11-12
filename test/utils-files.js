'use strict';

/**
 * Global Requires
 */
var colors = require('colors');

/**
 * Module Dependencies
 */

var fs = require('fs');
var path = require('path');
var relative = path.relative;
var basename = path.basename;
var join = path.join;
var expect = require('expect.js');

var utils = require('../lib/utils-files');

describe('utils-files', function() {

  describe('#getFileMappingFiles()', function() {

    it('only return the files-mapping file list by file patterns', function() {

      var files = utils.getFileMappingsFiles(['test/**/*.*'], ['.files']);
      var cwd = process.cwd();
      var filename;

      expect(files).to.have.length(3);
      for(var i = 0, len = files.length; i < len; ++i) {
        filename = basename(files[i]);
        switch (filename){
          case 'a.files':
            expect(files[i]).to.be(join(cwd, 'test', 'fixtures', 'mappings', 'a.files'));
            break;
          case 'b.files':
            expect(files[i]).to.be(join(cwd, 'test', 'fixtures', 'mappings', 'b.files'));
            break;
          case 'c.files':
            expect(files[i]).to.be(join(cwd, 'test', 'fixtures', 'mappings', 'c.files'));
            break;
        }
      }
    });
  });

  describe('#getMappingSync()', function() {

    it('return mapping objects by the files mapping file list', function() {
      var cwd = process.cwd();
      var files = [
        join(cwd, 'test', 'fixtures', 'mappings', 'a.files'),
        join(cwd, 'test', 'fixtures', 'mappings', 'b.files'),
        join(cwd, 'test', 'fixtures', 'mappings', 'c.files')
      ];
      var mappings = utils.getMappingSync(files);
      var filename;

      expect(mappings).to.have.length(3);
      for(var i = 0, len = mappings.length; i < len; ++i) {
        filename = basename(mappings[i].from);
        switch (filename) {
          case 'a.files':
            expect(mappings[i]['list']).to.eql({
              "../images/a1.jpg" : "a1/a1.png",
              "./img/a2.jpg" : "a2/a2.jpg"
            });
            break;

          case 'b.files':
            expect(mappings[i]['list']).to.eql({});
            break;

          case 'c.files':
            expect(mappings[i]['list']).to.eql({
              "../images/c.png" : "c/c.png",
              "./img/c.png" : "c/c2.png"
            });
            break;
        }
      }
    });
  })

  describe('#getMappedFromFiles()', function() {

    it('return the file list described by mapping objects', function() {
      var cwd = process.cwd();
      var files = [
        join(cwd, 'test', 'fixtures', 'mappings', 'a.files'),
        join(cwd, 'test', 'fixtures', 'mappings', 'b.files'),
        join(cwd, 'test', 'fixtures', 'mappings', 'c.files')
      ];
      var mappings = utils.getMappingSync(files);
      var assets = utils.getMappedFromFiles(mappings);
      var relapath;

      expect(assets).to.have.length(4);
      for(var i = 0, len = assets.length; i < len; ++i) {
        relapath = relative(__dirname, assets[i]);
        expect(~[ 'fixtures/images/a1.jpg',
          'fixtures/mappings/img/a2.jpg',
          'fixtures/images/c.png',
          'fixtures/mappings/img/c.png' ].indexOf(relapath)).to.be.ok();
      }
    });
  });

});
