

module.exports.github = {

  callback_url: '/auth/github_cb', // overridden in ./env/*
  scope: ['user', 'repo', 'write:repo_hook']

};
