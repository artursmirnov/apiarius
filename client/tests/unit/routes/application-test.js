/* jshint expr:true */
import { expect } from 'chai';
import {
  describeModule,
  it
} from 'ember-mocha';

describeModule(
  'route:application',
  'ApplicationRoute',
  {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
    needs: ['service:session']
  },
  function() {
    it('exists', function() {
      var route = this.subject();
      expect(route).to.be.ok;
    });
  }
);
