var md5 = require('md5');
var passport = require('passport');
var GithubStrategy = require('passport-github2').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({
    id: id
  }, function(err, user) {
    user = user || false;
    done(err, user);
  });
});

// Passport github strategy configuration
passport.use(
  new GithubStrategy({
      clientID: sails.config.github.client_id,
      clientSecret: sails.config.github.client_secret,
      callbackURL: sails.config.github.callback_url
    },
    function(accessToken, refreshToken, profile, done) {

      var newUserData = {
        username: profile.username,
        email: profile.emails[0].value,
        display_name: profile.displayName,
        github_id: profile.id,
        github_profile: profile.profileUrl
      };
      var searchCriteria = {
        username: profile.username
      };

      User.findOrCreate(searchCriteria, newUserData)
        .then(function(user) {
          user.github_token = accessToken;
          user.github_refresh_token = refreshToken;
          user.access_token = md5(accessToken);
          user.auth_code = md5(user.name + new Date().valueOf());
          return user.save();
        })
        .then(function(user) {
          done(null, user);
        })
        .catch(function(err) {
          done(err, false);
        });
    }
  )
);

// Passport local bearer strategy configuration
passport.use(
  new BearerStrategy(function(token, done) {

    User.findOne({ access_token: token })
      .then(function(user) {
        done(null, user);
      })
      .catch(function(err) {
        done(err, false);
      });

  })
);
