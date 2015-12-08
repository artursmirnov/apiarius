import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'client/config/environment';

export default OAuth2PasswordGrant.extend({

  serverTokenEndpoint: ENV.APP.apiPrefix + "/session",

  authenticate () {
    this._super()
      .catch( () => {
        document.location.href = ENV.APP.apiPrefix + "/login";
      });
  }

});
