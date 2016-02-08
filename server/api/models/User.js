/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    username: {
      type: 'string',
      required: true
    },

    display_name: {
      type: 'string'
    },

    email: {
      type: 'string',
      required: true
    },

    auth_code: {
      type: 'string',
      protected: true
    },

    access_token: {
      type: 'string',
      protected: true
    },

    github_id: {
      type: 'string',
      protected: true
    },

    github_profile: {
      type: 'string'
    },

    github_token: {
      type: 'string',
      protected: true
    },

    github_refresh_token: {
      type: 'string',
      protected: true
    },

    toJSON: function() {
      return {
        id: this.id,
        username: this.username,
        displayName: this.display_name,
        email: this.email,
        githubProfile: this.github_profile
      };
    }

  }
};
