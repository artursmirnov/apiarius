var path = require('path');
var Zip = require('adm-zip');

var SOURCES_ROOT_PATH = path.resolve('output');
var SOURCES_DIR_NAME = 'sources';
var ARCHIVE_FILE_NAME = 'sources.zip';

/**
 * @class BaseProvider
 * @constructor
 */
var BaseProvider = function() {};

BaseProvider.prototype.getArchiveDir = function(username, repo, commit) {
  return path.join(SOURCES_ROOT_PATH, username, repo, commit, SOURCES_DIR_NAME);
};

BaseProvider.prototype.getArchivePath = function(username, repo, commit) {
  return path.join(this.getArchiveDir(username, repo, commit), ARCHIVE_FILE_NAME);
};

BaseProvider.prototype.extractArchive = function() {
  var zip = new Zip(archivePath);
  zip.extractAllTo(archiveDir, true);
  return rsvp.Promise.resolve();
};

module.exports = BaseProvider;
