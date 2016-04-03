/**
 * DirectoryController
 *
 * @description :: Server-side logic for managing Directories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function(req, res) {
    var username = req.query.username;
    var reponame = req.query.reponame;
    var commit = req.query.commit;
    if (!username || !reponame || !commit) {
      return res.notFound();
    }
    SourceProvider.getArchiveLink(username, reponame, commit)
      .then(function(archiveLink) {
        return res.send({
          directories: [
            {
              commit: commit,
              arc: archiveLink
            }
          ]
        });
      })
      .catch(function(reason) {
        return res.forbidden(reason);
      });
  }

};

