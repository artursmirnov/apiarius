import Ember from 'ember';
import ENV from 'client/config/environment';

export default Ember.Route.extend({

  session: Ember.inject.service('session'),

  beforeModel(params) {
    let authCode = params.queryParams.auth_code;
    if (authCode) {
      return this.get('session').authenticate('authenticator:apiarius-github', authCode);
    } else {
      document.location.href = `${ENV.API.host}/${ENV.API.prefix}/auth/login`;
    }
  },

  afterModel() {
    this.transitionTo('index');
  }

});
