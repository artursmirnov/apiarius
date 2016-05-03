/**
 * DocController
 *
 * @description :: Server-side logic for managing Docs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs-extra');

module.exports = {

  index: function(req, res) {
    var username = req.query.username;
    var repo = req.query.repo;
    var commit = req.query.commit;
    if (!username || !repo || !commit) {
      return res.notFound();
    }
    SourceProvider.fetchSources(username, repo, commit)
      .then(function(sourceDir) {
        return DocumentationGenerator.generate(sourceDir, username, repo, commit);
      })
      .then(function(data) {
        res.send(JSON.stringify(data));
      })
      .catch(function(err) {
        return res.forbidden(err);
      });
  }

};

