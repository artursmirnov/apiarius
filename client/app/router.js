import Ember from 'ember';
import config from 'client/config/environment';

let Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('login-error');

  this.route('repo-user', { path: '/:username' }, function() {
    this.route('repository', { path: '/:repository' }, function() {});
  });
});

export default Router;
