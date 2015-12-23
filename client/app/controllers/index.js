import Ember from 'ember';

export default Ember.Controller.extend({

  session: Ember.inject.service('session'),

  errorMessage: "",

  actions: {

    login () {
      this.transitionToRoute('login');
    },

    logout () {
      this.get('session').invalidate();
    }

  }

});
