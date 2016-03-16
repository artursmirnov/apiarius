import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  user: DS.belongsTo('user'),
  tags: DS.hasMany('tag', { async: true }),
  releases: DS.hasMany('release', { async: true }),
  branches: DS.hasMany('branch', { async: true })
});
