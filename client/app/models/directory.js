import DS from 'ember-data';

export default DS.Model.extend({
  commit: DS.attr('string'),
  arc: DS.attr('string')
});
