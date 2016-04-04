/**
 * TagsController
 *
 * @description :: Server-side logic for managing tags
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function(req, res) {
    var username = req.query.username;
    var repo = req.query.repository;
    if (!username || !repo) return res.notFound();
    SourceProvider.getRepositoryTags(username, repo)
      .then(function(tags) {
        tags = tags.map(function(tag) {
          return {
            name: tag.name,
            sha: tag.commit.sha
          }
        });
        res.send({
          tags: tags
        });
      })
      .catch(function(err) {
        res.forbidden(err);
      });
  }

};

