/* global SourceProvider */
/**
 * RepoUserController
 *
 * @description :: Server-side logic for managing Repousers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function(req, res) {
    SourceProvider.getUser(req.query.username)
      .then(function(user) {
        res.send({
          'repo-user': {
            id: user.id,
            username: user.login,
            displayName: user.name,
            links: {
              repositories: sails.config.blueprints.prefix + '/repository?username=' + user.login
            }
          }
        });
      })
      .catch(function(err) {
        res.forbidden(err);
      });
  }

};

