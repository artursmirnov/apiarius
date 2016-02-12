/**
 * AuthController
 *
 * @description :: Server-side logic for managing authorization
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');

module.exports = {

  login: function(req, res) {
    passport.authenticate('github', {
      scope: sails.config.github.scope
    })(req, res);
  },

  github_cb: function(req, res) {
    passport.authenticate('github', function(err, user, info) {

      var failureRedirectUrl = sails.config.uiHost + '/login-error';
      var successRedirectUrl = sails.config.uiHost + '/login?auth_code=';

      if (err || !user || !user.auth_code) return res.redirect(failureRedirectUrl);

      successRedirectUrl += user.auth_code;
      req.logIn(user, function(err) {
        res.redirect(err ? failureRedirectUrl : successRedirectUrl);
      });

    })(req, res);
  },

  token: function(req, res) {
    var authCode = req.body.auth_code;
    if (!authCode) return res.forbidden('Auth code not found');

    User.findOne({ auth_code: authCode })
      .then(function(user) {
        if (!user) {
          res.notFound('Incorrect auth code');
        } else if (!user.access_token) {
          res.forbidden('User does not authorized with github');
        } else {
          user.auth_code = null;
          return user.save();
        }
      })
      .then(function(user) {
        res.send({
          access_token: user.access_token
        });
      })
      .catch(function(err) {
        res.serverError(err);
      });
  },

  logout: function(req, res) {
    var accessToken = req.body.token;
    if (!accessToken) return res.notFound('No such session');
    User.findOne({ access_token: accessToken })
      .then(function(user) {
        if (user) {
          user.access_token = null;
          return user.save();
        } else {
          res.notFound('No such session');
        }
      })
      .then(function() {
        req.logout();
        res.ok();
      })
      .catch(function(err) {
        res.serverError(err);
      });
  }

};
