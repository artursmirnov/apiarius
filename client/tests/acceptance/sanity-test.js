/* jshint expr:true */
import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import Ember from 'ember';

describe('Acceptance: Sanity', function() {
  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    Ember.run(application, 'destroy');
  });

  describe('test', function() {
    it('should be ok', function() {
      expect(false).to.be.ok;
    });
  });

  it('can run tests', function() {
    expect('everthing').to.be.ok;
  });
});
