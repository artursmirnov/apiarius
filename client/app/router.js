import Ember from 'ember';
import config from 'client/config/environment';

let Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('login-error');
});

export default Router;
