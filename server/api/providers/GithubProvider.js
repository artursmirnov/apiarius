
var rsvp = require('rsvp');
var GithubAPI = require('github');

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

GithubManager.prototype.fetchSources = function() {

};

GithubManager.prototype.getRepositories = function(username) {
  return runGithubAPI(github.repos.getFromUser, { user: username });
};

GithubManager.prototype.getRepository = function(username, repoName) {
  return runGithubAPI(github.repos.get, { user: username, repo: repoName });
};

GithubManager.prototype.getRepositoryTags = function(username, repoName, page, limit) {
  return runGithubAPI(github.repos.getTags, { user: username, repo: repoName, page: page, per_page: limit});
};

GithubManager.prototype.getRepositoryReleases = function(username, repoName, page, limit) {
  return runGithubAPI(github.releases.listReleases, { owner: username, repo: repoName, page: page, per_page: limit});
};

GithubManager.prototype.getRepositoryBranches = function(username, repoName, page, limit) {
  return runGithubAPI(github.repos.getBranches, { user: username, repo: repoName, page: page, per_page: limit});
};

GithubManager.prototype.getArchiveLink = function(username, repoName, refType, ref) {
  var ref = 'refs/';
  switch (refType) {
    case 'tag':
    case 'release':
      ref += 'tags/' + ref;
      break;
    case 'branch':
      ref += 'heads/' + ref;
      break;
    default:
      throw new Error('Incorrect ref type');
  }
  return runGithubAPI(github.repos.getArchiveLink, { user: username, repo: repoName, ref: ref, archive_format: 'zipball' });
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
