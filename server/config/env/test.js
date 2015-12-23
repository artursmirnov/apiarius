module.exports = {

  apiHost: 'http://localhost:1337',
  uiHost: 'http://localhost:4200',

  github: {
    callback_url: 'http://localhost:1337/api/v1/auth/github_cb',
    client_id: '123',
    client_secret: '123'
  },

  cors: {
    allRoutes: true,
    origin: '*'
  }

};
