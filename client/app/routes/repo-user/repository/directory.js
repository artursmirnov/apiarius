import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    // TODO get directory data with a link to doc data from `DirectoryController`
    let username = this.modelFor('repo-user').get('username');
    let repo = this.modelFor('repo-user.repository').get('name');
    let commit = params.sha;
    return this.store.queryRecord('directory', { username, repo, commit });
  },

  setupController(controller, model) {
    this._super(...arguments);
    // TODO create `docs` and parse the data from payload (`DocumentationController`)
  }

});
