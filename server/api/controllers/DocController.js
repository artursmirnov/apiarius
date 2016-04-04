/**
 * DocController
 *
 * @description :: Server-side logic for managing Docs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function(req, res) {
    var username = req.query.username;
    var repo = req.query.repo;
    var commit = req.query.commit;
    if (!username || !repo || !commit) {
      return res.notFound();
    }
    SourceProvider.fetchSources(username, repo, commit)
      .then(function() {
        res.ok();
      })
      .catch(function(err) {
        return res.forbidden(err);
      });
  }

};

