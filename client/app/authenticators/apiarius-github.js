import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'client/config/environment';

export default OAuth2PasswordGrant.extend({

  serverTokenEndpoint: "/" + ENV.APP.apiPrefix + "/session",

  authenticate (options) {
    this._super()
      .catch( (reason) => {
        document.location.href = "/" + ENV.APP.apiPrefix + "/login";
      });
  }

});
