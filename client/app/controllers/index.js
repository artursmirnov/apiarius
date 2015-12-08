import Ember from 'ember';

export default Ember.Controller.extend({

  session: Ember.inject.service('session'),

  errorMessage: "",

  actions: {

    login () {
      this.get('session').authenticate('authenticator:apiarius-github').catch( (reason) => {
        this.set('errorMessage', reason);
      });
    },

    logout () {
      this.get('session').invalidate();
    }

  }

});
