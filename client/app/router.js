import Ember from 'ember';
import config from 'client/config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
});

export default Router;
