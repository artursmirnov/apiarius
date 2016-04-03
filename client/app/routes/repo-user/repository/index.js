import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.modelFor('repo-user.repository');
  },

  setupController(controller, model) {
    this._super(...arguments);

    controller.set('isLoadingTags', true);
    model.get('tags').then((tags) => {
      controller.setProperties({
        tags,
        isLoadingTags: false
      });
    });

    controller.set('isLoadingBranches', true);
    model.get('branches').then((branches) => {
      controller.setProperties({
        branches,
        isLoadingBranches: false
      });
    });
  }

});
