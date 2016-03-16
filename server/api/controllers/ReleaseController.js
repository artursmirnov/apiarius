/**
 * ReleaseController
 *
 * @description :: Server-side logic for managing releases
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function(req, res) {
    var username = req.query.username;
    var reponame = req.query.repository;
    if (!username || !reponame) return res.notFound();
    SourceProvider.getRepositoryReleases(username, reponame)
      .then(function(releases) {
        releases = releases.map(function(release) {
          return {
            id: release.id,
            name: release.name
          }
        });
        res.send({
          releases: releases
        });
      })
      .catch(function(err) {
        res.forbidden(err);
      });
  }

};

