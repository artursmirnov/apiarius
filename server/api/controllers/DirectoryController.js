/**
 * DirectoryController
 *
 * @description :: Server-side logic for managing Directories
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
    return res.send({
      directories: [
        {
          commit: commit
        }
      ]
    });
  }

};

