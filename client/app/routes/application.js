import Ember from 'ember';
import AuthApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(AuthApplicationRouteMixin, {

  sessionAuthenticated() {
    this.store.find('user', 'me').then((user) => {
      this.get('session').set('data.user', user);
    });
  },

  sessionInvalidated() {
    this.get('session').set('user', null);
  }

});
