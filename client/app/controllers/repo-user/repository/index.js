import Ember from 'ember';

export default Ember.Controller.extend({
  tags: [],
  releases: [],
  branches: [],

  isLoadingTags: false,
  isLoadingReleases: false,
  isLoadingBranches: false
});
