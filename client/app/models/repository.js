import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  user: DS.belongsTo('user'),
  tags: DS.hasMany('tag', { async: true }),
  branches: DS.hasMany('branch', { async: true })
});
