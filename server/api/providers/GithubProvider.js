var BaseProvider = require('./BaseProvider');
var rsvp = require('rsvp');
var GithubAPI = require('github');
var fs = require('fs-extra');
var path = require('path');
var wget = require('wget-improved');
var Zip = require('adm-zip');

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

module.exports = GithubProvider;

/**
 * @class GithubProvider
 * @extends BaseProvider
 * @constructor
 */
function GithubProvider() {}
GithubProvider.prototype = new BaseProvider();

GithubProvider.prototype.authenticate = function(data) {
  return github.authenticate(data);
};

GithubProvider.prototype.fetchSources = function(username, repo, commit) {
  var archiveDir = this.getArchiveDir(username, repo, commit);
  var archivePath = this.getArchivePath(username, repo, commit);
  fs.ensureDirSync(archiveDir);
  return this.getArchiveLink(username, repo, commit)
    .then(function(archiveLink) {
      return new rsvp.Promise(function(resolve, reject) {
        var download = wget.download(archiveLink, archivePath);
        download.on('end', function() {
          var entryName = repo + '-' + commit;
          var zip = new Zip(archivePath);
          zip.extractAllTo(archiveDir);
          fs.removeSync(archivePath);
          resolve(path.join(archiveDir, entryName));
        });
        download.on('error', function(err) {
          reject(err);
        });
      });
    });
};

GithubProvider.prototype.getRepositories = function(username) {
  return runGithubAPI(github.repos.getFromUser, { user: username });
};

GithubProvider.prototype.getRepository = function(username, repo) {
  return runGithubAPI(github.repos.get, { user: username, repo: repo });
};

GithubProvider.prototype.getRepositoryTags = function(username, repo, page, limit) {
  return runGithubAPI(github.repos.getTags, { user: username, repo: repo, page: page, per_page: limit});
};

GithubProvider.prototype.getRepositoryReleases = function(username, repo, page, limit) {
  return runGithubAPI(github.releases.listReleases, { owner: username, repo: repo, page: page, per_page: limit});
};

GithubProvider.prototype.getRepositoryBranches = function(username, repo, page, limit) {
  return runGithubAPI(github.repos.getBranches, { user: username, repo: repo, page: page, per_page: limit});
};

GithubProvider.prototype.getArchiveLink = function(username, repo, commit) {
  var url = 'https://github.com/' + username + '/' + repo + '/archive/' + commit + '.zip';
  return rsvp.Promise.resolve(url);
};

GithubProvider.prototype.getUser = function(username) {
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
