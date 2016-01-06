import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from 'client/config/environment';

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
  jscsOptions: {
    configPath: '.jscsrc',
    enabled: true,
    esnext: true,
    disableTestGenerator: false
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
