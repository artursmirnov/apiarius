/**
 * BranchController
 *
 * @description :: Server-side logic for managing branches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function(req, res) {
    var username = req.query.username;
    var repo = req.query.repository;
    if (!username || !repo) return res.notFound();
    SourceProvider.getRepositoryBranches(username, repo)
      .then(function(branches) {
        branches = branches.map(function(branch) {
          return {
            name: branch.name,
            sha: branch.commit.sha
          }
        });
        res.send({
          branches: branches
        });
      })
      .catch(function(err) {
        res.forbidden(err);
      });
  }

};

