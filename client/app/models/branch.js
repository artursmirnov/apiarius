import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  sha: DS.attr('string'),
  repository: DS.belongsTo('repository')
});
