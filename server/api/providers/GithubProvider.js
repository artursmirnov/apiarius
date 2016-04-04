
var rsvp = require('rsvp');
var GithubAPI = require('github');
var fs = require('fs-extra');
var path = require('path');
var wget = require('wget-improved');
var Zip = require('adm-zip');

var DOCS_ROOT_PATH = path.resolve('output');
var TMP_DIR_NAME = '.tmp';
var ARCHIVE_FILE_NAME = 'sources.zip';

var github = new GithubAPI({
  version: '3.0.0',
  protocol: 'https',
  host: 'api.github.com',
  timeout: 60000,
  debug: true,
  headers: {
    'user-agent': 'apiarius-github-agent' // GitHub is happy with a unique user agent
  }
});

function GithubManager() {}

module.exports = GithubManager;

GithubManager.prototype.authenticate = function(data) {
  return github.authenticate(data);
};

GithubManager.prototype.fetchSources = function(username, repo, commit) {
  var archiveDir = path.join(DOCS_ROOT_PATH, username, repo, commit, TMP_DIR_NAME);
  fs.ensureDirSync(archiveDir);
  var archivePath = path.join(archiveDir, ARCHIVE_FILE_NAME);
  return this.getArchiveLink(username, repo, commit)
    .then(function(archiveLink) {
      return new rsvp.Promise(function(resolve, reject) {
        var download = wget.download(archiveLink, archivePath);
        download.on('end', function(output) {
          resolve(output);
        });
        download.on('error', function(err) {
          reject(err);
        });
      });
    })
    .then(function() {
      var zip = new Zip(archivePath);
      zip.extractAllTo(archiveDir, true);
      return rsvp.Promise.resolve();
    })
};

GithubManager.prototype.getRepositories = function(username) {
  return runGithubAPI(github.repos.getFromUser, { user: username });
};

GithubManager.prototype.getRepository = function(username, repo) {
  return runGithubAPI(github.repos.get, { user: username, repo: repo });
};

GithubManager.prototype.getRepositoryTags = function(username, repo, page, limit) {
  return runGithubAPI(github.repos.getTags, { user: username, repo: repo, page: page, per_page: limit});
};

GithubManager.prototype.getRepositoryReleases = function(username, repo, page, limit) {
  return runGithubAPI(github.releases.listReleases, { owner: username, repo: repo, page: page, per_page: limit});
};

GithubManager.prototype.getRepositoryBranches = function(username, repo, page, limit) {
  return runGithubAPI(github.repos.getBranches, { user: username, repo: repo, page: page, per_page: limit});
};

GithubManager.prototype.getArchiveLink = function(username, repo, commit) {
  var url = 'https://github.com/' + username + '/' + repo + '/archive/' + commit + '.zip';
  return rsvp.Promise.resolve(url);
};

GithubManager.prototype.getUser = function(username) {
  return runGithubAPI(github.user.getFrom, { user: username });
};


function runGithubAPI(method, data) {
  return new rsvp.Promise(function(resolve, reject) {
    if (typeof method !== 'function') return reject('Invalid Github API method');
    method(data, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
