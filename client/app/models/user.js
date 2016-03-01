import DS from 'ember-data';
import RepoUser from './repo-user';

export default RepoUser.extend({
  email: DS.attr('string'),
  githubProfile: DS.attr('string')
});
