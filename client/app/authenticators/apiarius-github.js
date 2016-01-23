import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'client/config/environment';

export default OAuth2PasswordGrant.extend({

  serverTokenEndpoint: `${ENV.API.host}/${ENV.API.prefix}/auth/token`,

  serverTokenRevocationEndpoint: `${ENV.API.host}/${ENV.API.prefix}/auth/logout`,

  refreshAccessTokens: false,

  authenticate(authCode) {
    return this.makeRequest(this.get('serverTokenEndpoint'), {
      grant_type: 'auth_code',
      auth_code: authCode
    });
  }

});
