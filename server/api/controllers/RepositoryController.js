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
              name: repository.name
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
