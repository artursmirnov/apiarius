module.exports = {

  github: {
    callback_url: '/auth/github_cb', // overridden in ./env/*,
    client_id: '123', // defaults for tests
    client_secret: '123', // defaults for tests
    scope: ['user', 'repo', 'write:repo_hook']
  },

  connections: {
    localDiskDb: {
      adapter: 'sails-disk'
    }
  },

  models: {
    connection: 'localDiskDb' // check connection name
  }

};
