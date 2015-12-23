/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

var passport = require('passport');

module.exports = function (req, res, next) {
  var authHeader = req.headers.authorization || '';
  var token = authHeader.replace("Bearer ", "");
  if (!token) return res.unauthorized();
  User.findOne( { access_token: token }, function (err, user) {
    if (err || !user) return res.unauthorized();
    req.user = user;
    return next();
  });
};

//module.exports = passport.authenticate('bearer', { session: false });
