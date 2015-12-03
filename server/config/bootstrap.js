/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var passport = require('passport');
var GithubStrategy = require('passport-github2').Strategy;

module.exports.bootstrap = function(cb) {

  // Passport strategy configuration
  passport.use(
    new GithubStrategy(
      {
        clientID: sails.config.github.client_id,
        clientSecret: sails.config.github.client_secret,
        callbackURL: sails.config.github.callback_url
      },
      function (accessToken, refreshToken, profile, done) {
        User.findOrCreate({github_token: accessToken}, {
          name: profile.login,
          email: profile.email,
          github_token: accessToken
        }, function (err, user) {
          return done(err, user);
        });
      }
    )
  );

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
