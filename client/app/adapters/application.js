import DS from 'ember-data';
import config from 'client/config/environment';
import AuthDataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.RESTAdapter.extend(AuthDataAdapterMixin, {
  coalesceFindRequests: true,
  namespace: config.apiPrefix,
  //this is dependent on production/development environment
  //It is configured in config/environment.js
  //host: ClientENV.hostUrl
  //add IP from $DOCKER_HOST if --docker flag is set
  //host: 'http://192.168.59.103:1337'

  authorizer: 'authorizer:apiarius-github'

});
