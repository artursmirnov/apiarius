import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    return this.modelFor('repo-user').get('repositories').then((repositories) => {
      return repositories.findBy('name', params.repository);
    });
  }

});
