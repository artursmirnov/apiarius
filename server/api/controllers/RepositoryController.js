/* global Repository */
/* global User */
/**
 * RepositoryController
 *
 * @description :: Server-side logic for managing directories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function(req, res) {
    var username = req.query.username;
    if (!username) return res.notFound();
    SourceProvider.getRepositories(username)
      .then(function(repositories) {
        repositories = repositories || [];
        repositories = repositories
          // .filter(function(repository) {
          //   return !repository.fork;
          // })
          .map(function(repository) {
            return {
              id: repository.id,
              name: repository.name,
              links: {
                tags: sails.config.blueprints.prefix + '/tag?username=' + username + '&repository=' + repository.name,
                releases: sails.config.blueprints.prefix + '/release?username=' + username + '&repository=' + repository.name,
                branches: sails.config.blueprints.prefix + '/branch?username=' + username + '&repository=' + repository.name
              }
            };
          });
        res.send({
          repositories: repositories
        });
      })
      .catch(function(err) {
        res.forbidden(err);
      });
  }

};
