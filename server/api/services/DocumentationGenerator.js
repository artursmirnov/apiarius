var rsvp = require('rsvp');
var YUI = require('yuidocjs');
var lodash = require('lodash');
var path = require('path');
var fs = require('fs-extra');

var DOCS_ROOT_PATH = path.resolve('output');
var DOCS_DIR_NAME = 'docs';

var yuidocOptions = {
  quiet: true,
  server: false,
  parseOnly: true,
  lint: false,
  paths: []
};

function DocumentationGenerator() {}

DocumentationGenerator.generate = function(sourceDir, username, repo, commit) {
  return new rsvp.Promise(function(resolve, reject) {
    var options = _buildOptions(sourceDir, username, repo, commit);
    var outputFilePath = path.join(options.outdir, 'data.json');
    var data = (new YUI.YUIDoc(options)).run();
    fs.writeFileSync(outputFilePath, data);
    resolve(data);
    //var builder = new YUI.DocBuilder(options, data);
    //builder.compile(function() {
    //  resolve();
    //});
  });
};

function _buildOptions(sourcePath, username, repo, commit) {
  return lodash.defaults({
    outdir: _getOutputDir(username, repo, commit),
    paths: [sourcePath]
  }, yuidocOptions);
}

function _getOutputDir(username, repo, commit) {
  return path.join(DOCS_ROOT_PATH, username, repo, commit, DOCS_DIR_NAME);
}

module.exports = DocumentationGenerator;
