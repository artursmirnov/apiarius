
var rsvp = require('rsvp');
var GithubAPI = require('github');

var github = new GithubAPI({
  version: '3.0.0',
  protocol: 'https',
  host: 'api.github.com',
  timeout: 5000,
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
