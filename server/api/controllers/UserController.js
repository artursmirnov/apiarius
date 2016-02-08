/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  me: function(req, res) {
    if (req.user) {
      res.ok({
        user: req.user.toJSON()
      });
    } else {
      res.unauthorized();
    }
  }

};
