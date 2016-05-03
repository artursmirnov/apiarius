/*jshint quotmark: false*/

'use strict';

var Promise          = require('../../lib/ext/promise');
var assertFile       = require('ember-cli-internal-test-helpers/lib/helpers/assert-file');
var assertFileEquals = require('ember-cli-internal-test-helpers/lib/helpers/assert-file-equals');
var conf             = require('ember-cli-internal-test-helpers/lib/helpers/conf');
var ember            = require('../helpers/ember');
var replaceFile      = require('ember-cli-internal-test-helpers/lib/helpers/file-utils').replaceFile;
var fs               = require('fs-extra');
var outputFile       = Promise.denodeify(fs.outputFile);
var path             = require('path');
var remove           = Promise.denodeify(fs.remove);
var root             = process.cwd();
var tmproot          = path.join(root, 'tmp');
var expect           = require('chai').expect;
var mkTmpDirIn       = require('../../lib/utilities/mk-tmp-dir-in');

var Blueprint        = require('../../lib/models/blueprint');
var BlueprintNpmTask = require('ember-cli-internal-test-helpers/lib/helpers/disable-npm-on-blueprint');

describe('Acceptance: ember generate pod', function() {
  this.timeout(20000);

  var tmpdir;

  before(function() {
    BlueprintNpmTask.disableNPM(Blueprint);
    conf.setup();
  });

  after(function() {
    BlueprintNpmTask.restoreNPM(Blueprint);
    conf.restore();
  });

  beforeEach(function() {
    return mkTmpDirIn(tmproot).then(function(dir) {
      tmpdir = dir;
      process.chdir(tmpdir);
    });
  });

  afterEach(function() {
    this.timeout(10000);

    process.chdir(root);
    return remove(tmproot);
  });

  function initApp() {
    return ember([
      'init',
      '--name=my-app',
      '--skip-npm',
      '--skip-bower'
    ]);
  }

  function initAddon() {
    return ember([
      'addon',
      'my-addon',
      '--skip-npm',
      '--skip-bower'
    ]);
  }

  function initInRepoAddon() {
    return initApp().then(function() {
      return ember([
        'generate',
        'in-repo-addon',
        'my-addon'
      ]);
    });
  }

  function preGenerate(args) {
    var generateArgs = ['generate'].concat(args);

    return initApp().then(function() {
      return ember(generateArgs);
    });
  }

  function generate(args) {
    var generateArgs = ['generate'].concat(args);

    return initApp().then(function() {
      return ember(generateArgs);
    });
  }

  function generateWithPrefix(args) {
    var generateArgs = ['generate'].concat(args);

    return initApp().then(function() {
      replaceFile('config/environment.js', "var ENV = {", "var ENV = {\npodModulePrefix: 'app/pods', \n");
      return ember(generateArgs);
    });
  }

  function generateWithUsePods(args) {
    var generateArgs = ['generate'].concat(args);

    return initApp().then(function() {
      replaceFile('.ember-cli', '"disableAnalytics": false', '"disableAnalytics": false,\n"usePods" : true\n');
      return ember(generateArgs);
    });
  }

  function generateWithUsePodsDeprecated(args) {
    var generateArgs = ['generate'].concat(args);

    return initApp().then(function() {
      replaceFile('config/environment.js', "var ENV = {", "var ENV = {\nusePodsByDefault: true, \n");
      return ember(generateArgs);
    });
  }

  function generateInAddon(args) {
    var generateArgs = ['generate'].concat(args);

    return initAddon().then(function() {
      return ember(generateArgs);
    });
  }

  function generateInRepoAddon(args) {
    var generateArgs = ['generate'].concat(args);

    return initInRepoAddon().then(function() {
      return ember(generateArgs);
    });
  }

  it('.ember-cli usePods setting generates in pod structure without --pod flag', function() {
    return generateWithUsePods(['controller', 'foo']).then(function() {
      assertFile('app/foo/controller.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Controller.extend({\n});"
        ]
      });
      assertFile('tests/unit/foo/controller-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('controller:foo'"
        ]
      });
    });
  });

  it('.ember-cli usePods setting generates in classic structure with --classic flag', function() {
    return generateWithUsePods(['controller', 'foo', '--classic']).then(function() {
      assertFile('app/controllers/foo.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Controller.extend({\n});"
        ]
      });
      assertFile('tests/unit/controllers/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('controller:foo'"
        ]
      });
    });
  });

  it('.ember-cli usePods setting generates correct component structure', function() {
    return generateWithUsePods(['component', 'x-foo']).then(function() {
      assertFile('app/components/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/components/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/components/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('x-foo'",
          "integration: true"
        ]
      });
    });
  });

  it('controller foo --pod', function() {
    return generate(['controller', 'foo', '--pod']).then(function() {
      assertFile('app/foo/controller.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Controller.extend({\n});"
        ]
      });
      assertFile('tests/unit/foo/controller-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('controller:foo'"
        ]
      });
    });
  });

  it('controller foo --pod podModulePrefix', function() {
    return generateWithPrefix(['controller', 'foo', '--pod']).then(function() {
      assertFile('app/pods/foo/controller.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Controller.extend({\n});"
        ]
      });
      assertFile('tests/unit/pods/foo/controller-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('controller:foo'"
        ]
      });
    });
  });

  it('controller foo/bar --pod', function() {
    return generate(['controller', 'foo/bar', '--pod']).then(function() {
      assertFile('app/foo/bar/controller.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Controller.extend({\n});"
        ]
      });
      assertFile('tests/unit/foo/bar/controller-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('controller:foo/bar'"
        ]
      });
    });
  });

  it('controller foo/bar --pod podModulePrefix', function() {
    return generateWithPrefix(['controller', 'foo/bar', '--pod']).then(function() {
      assertFile('app/pods/foo/bar/controller.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Controller.extend({\n});"
        ]
      });
      assertFile('tests/unit/pods/foo/bar/controller-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('controller:foo/bar'"
        ]
      });
    });
  });

  it('component x-foo --pod', function() {
    return generate(['component', 'x-foo', '--pod']).then(function() {
      assertFile('app/components/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/components/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/components/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('x-foo'",
          "integration: true"
        ]
      });
    });
  });

  it('component x-foo --pod podModulePrefix', function() {
    return generateWithPrefix(['component', 'x-foo', '--pod']).then(function() {
      assertFile('app/pods/components/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/pods/components/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/pods/components/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('x-foo'",
          "integration: true",
          "{{x-foo}}",
          "{{#x-foo}}"
        ]
      });
    });
  });

  it('component foo/x-foo --pod', function() {
    return generate(['component', 'foo/x-foo', '--pod']).then(function() {
      assertFile('app/components/foo/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/components/foo/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/components/foo/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('foo/x-foo'",
          "integration: true",
          "{{foo/x-foo}}",
          "{{#foo/x-foo}}"
        ]
      });
    });
  });

  it('component foo/x-foo --pod podModulePrefix', function() {
    return generateWithPrefix(['component', 'foo/x-foo', '--pod']).then(function() {
      assertFile('app/pods/components/foo/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/pods/components/foo/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/pods/components/foo/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('foo/x-foo'",
          "integration: true",
          "{{foo/x-foo}}",
          "{{#foo/x-foo}}"
        ]
      });
    });
  });

  it('component x-foo --pod --path', function() {
    return generate(['component', 'x-foo', '--pod', '--path', 'bar']).then(function() {
      assertFile('app/bar/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/bar/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/bar/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('bar/x-foo'",
          "integration: true",
          "{{bar/x-foo}}",
          "{{#bar/x-foo}}"
        ]
      });
    });
  });

  it('component x-foo --pod --path podModulePrefix', function() {
    return generateWithPrefix(['component', 'x-foo', '--pod', '--path', 'bar']).then(function() {
      assertFile('app/pods/bar/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/pods/bar/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/pods/bar/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('bar/x-foo'",
          "integration: true",
          "{{bar/x-foo}}",
          "{{#bar/x-foo}}"
        ]
      });
    });
  });

  it('component foo/x-foo --pod --path', function() {
    return generate(['component', 'foo/x-foo', '--pod', '--path', 'bar']).then(function() {
      assertFile('app/bar/foo/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/bar/foo/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/bar/foo/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('bar/foo/x-foo'",
          "integration: true",
          "{{bar/foo/x-foo}}",
          "{{#bar/foo/x-foo}}"
        ]
      });
    });
  });

  it('component foo/x-foo --pod --path podModulePrefix', function() {
    return generateWithPrefix(['component', 'foo/x-foo', '--pod', '--path', 'bar']).then(function() {
      assertFile('app/pods/bar/foo/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/pods/bar/foo/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/pods/bar/foo/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "moduleForComponent('bar/foo/x-foo'",
          "integration: true",
          "{{bar/foo/x-foo}}",
          "{{#bar/foo/x-foo}}"
        ]
      });
    });
  });

  it('component x-foo --pod --path nested', function() {
    return generate(['component', 'x-foo', '--pod', '--path', 'bar/baz']).then(function() {
      assertFile('app/bar/baz/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/bar/baz/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/bar/baz/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('bar/baz/x-foo'",
          "integration: true",
          "{{bar/baz/x-foo}}",
          "{{#bar/baz/x-foo}}"
        ]
      });
    });
  });

  it('component x-foo --pod --path nested podModulePrefix', function() {
    return generateWithPrefix(['component', 'x-foo', '--pod', '--path', 'bar/baz']).then(function() {
      assertFile('app/pods/bar/baz/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/pods/bar/baz/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/pods/bar/baz/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('bar/baz/x-foo'",
          "integration: true",
          "{{bar/baz/x-foo}}",
          "{{#bar/baz/x-foo}}"
        ]
      });
    });
  });

  it('component foo/x-foo --pod --path nested', function() {
    return generate(['component', 'foo/x-foo', '--pod', '--path', 'bar/baz']).then(function() {
      assertFile('app/bar/baz/foo/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/bar/baz/foo/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/bar/baz/foo/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('bar/baz/foo/x-foo'",
          "integration: true",
          "{{bar/baz/foo/x-foo}}",
          "{{#bar/baz/foo/x-foo}}"
        ]
      });
    });
  });

  it('component foo/x-foo --pod --path nested podModulePrefix', function() {
    return generateWithPrefix(['component', 'foo/x-foo', '--pod', '--path', 'bar/baz']).then(function() {
      assertFile('app/pods/bar/baz/foo/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/pods/bar/baz/foo/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/pods/bar/baz/foo/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('bar/baz/foo/x-foo'",
          "integration: true",
          "{{bar/baz/foo/x-foo}}",
          "{{#bar/baz/foo/x-foo}}"
        ]
      });
    });
  });

  it('component x-foo --pod -no-path', function() {
    return generate(['component', 'x-foo', '--pod', '-no-path']).then(function() {
      assertFile('app/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('x-foo'",
          "integration: true",
          "{{x-foo}}",
          "{{#x-foo}}"
        ]
      });
    });
  });

  it('component x-foo --pod -no-path podModulePrefix', function() {
    return generateWithPrefix(['component', 'x-foo', '--pod', '-no-path']).then(function() {
      assertFile('app/pods/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/pods/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/pods/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('x-foo'",
          "integration: true",
          "{{x-foo}}",
          "{{#x-foo}}"
        ]
      });
    });
  });

  it('component foo/x-foo --pod -no-path', function() {
    return generate(['component', 'foo/x-foo', '--pod', '-no-path']).then(function() {
      assertFile('app/foo/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/foo/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/foo/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('foo/x-foo'",
          "integration: true",
          "{{foo/x-foo}}",
          "{{#foo/x-foo}}"
        ]
      });
    });
  });

  it('component foo/x-foo --pod -no-path podModulePrefix', function() {
    return generateWithPrefix(['component', 'foo/x-foo', '--pod', '-no-path']).then(function() {
      assertFile('app/pods/foo/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Component.extend({",
          "});"
        ]
      });
      assertFile('app/pods/foo/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('tests/integration/pods/foo/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('foo/x-foo'",
          "integration: true",
          "{{foo/x-foo}}",
          "{{#foo/x-foo}}"
        ]
      });
    });
  });

  it('helper foo-bar --pod', function() {
    return generate(['helper', 'foo-bar', '--pod']).then(function() {
      assertFile('app/helpers/foo-bar.js', {
        contains: "import Ember from 'ember';\n\n" +
                  "export function fooBar(params/*, hash*/) {\n" +
                  "  return params;\n" +
                  "}\n\n" +
                  "export default Ember.Helper.helper(fooBar);"
      });
      assertFile('tests/unit/helpers/foo-bar-test.js', {
        contains: "import { fooBar } from 'my-app/helpers/foo-bar';"
      });
    });
  });

  it('helper foo-bar --pod podModulePrefix', function() {
    return generateWithPrefix(['helper', 'foo-bar', '--pod']).then(function() {
      assertFile('app/helpers/foo-bar.js', {
        contains: "import Ember from 'ember';\n\n" +
                  "export function fooBar(params/*, hash*/) {\n" +
                  "  return params;\n" +
                  "}\n\n" +
                  "export default Ember.Helper.helper(fooBar);"
      });
      assertFile('tests/unit/helpers/foo-bar-test.js', {
        contains: "import { fooBar } from 'my-app/helpers/foo-bar';"
      });
    });
  });

  it('helper foo/bar-baz --pod', function() {
    return generate(['helper', 'foo/bar-baz', '--pod']).then(function() {
      assertFile('app/helpers/foo/bar-baz.js', {
        contains: "import Ember from 'ember';\n\n" +
                  "export function fooBarBaz(params/*, hash*/) {\n" +
                  "  return params;\n" +
                  "}\n\n" +
                  "export default Ember.Helper.helper(fooBarBaz);"
      });
      assertFile('tests/unit/helpers/foo/bar-baz-test.js', {
        contains: "import { fooBarBaz } from 'my-app/helpers/foo/bar-baz';"
      });
    });
  });

  it('helper foo/bar-baz --pod podModulePrefix', function() {
    return generateWithPrefix(['helper', 'foo/bar-baz', '--pod']).then(function() {
      assertFile('app/helpers/foo/bar-baz.js', {
        contains: "import Ember from 'ember';\n\n" +
                  "export function fooBarBaz(params/*, hash*/) {\n" +
                  "  return params;\n" +
                  "}\n\n" +
                  "export default Ember.Helper.helper(fooBarBaz);"
      });
      assertFile('tests/unit/helpers/foo/bar-baz-test.js', {
        contains: "import { fooBarBaz } from 'my-app/helpers/foo/bar-baz';"
      });
    });
  });

  it('model foo --pod', function() {
    return generate(['model', 'foo', '--pod']).then(function() {
      assertFile('app/foo/model.js', {
        contains: [
          "import DS from 'ember-data';",
          "export default DS.Model.extend"
        ]
      });
      assertFile('tests/unit/foo/model-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo'"
        ]
      });
    });
  });

  it('model foo --pod podModulePrefix', function() {
    return generateWithPrefix(['model', 'foo', '--pod']).then(function() {
      assertFile('app/pods/foo/model.js', {
        contains: [
          "import DS from 'ember-data';",
          "export default DS.Model.extend"
        ]
      });
      assertFile('tests/unit/pods/foo/model-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo'"
        ]
      });
    });
  });

  it('model foo --pod with attributes', function() {
    return generate([
      'model',
      'foo',
      'noType',
      'firstName:string',
      'created_at:date',
      'is-published:boolean',
      'rating:number',
      'bars:has-many',
      'baz:belongs-to',
      'echo:hasMany',
      'bravo:belongs_to',
      '--pod'
    ]).then(function() {
      assertFile('app/foo/model.js', {
        contains: [
          "noType: DS.attr()",
          "firstName: DS.attr('string')",
          "createdAt: DS.attr('date')",
          "isPublished: DS.attr('boolean')",
          "rating: DS.attr('number')",
          "bars: DS.hasMany('bar')",
          "baz: DS.belongsTo('baz')",
          "echos: DS.hasMany('echo')",
          "bravo: DS.belongsTo('bravo')"
        ]
      });
      assertFile('tests/unit/foo/model-test.js', {
        contains: "needs: ['model:bar', 'model:baz', 'model:echo', 'model:bravo']"
      });
    });
  });

  it('model foo/bar --pod', function() {
    return generate(['model', 'foo/bar', '--pod']).then(function() {
      assertFile('app/foo/bar/model.js', {
        contains: [
          "import DS from 'ember-data';",
          "export default DS.Model.extend"
        ]
      });
      assertFile('tests/unit/foo/bar/model-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo/bar'"
        ]
      });
    });
  });

  it('model foo/bar --pod podModulePrefix', function() {
    return generateWithPrefix(['model', 'foo/bar', '--pod']).then(function() {
      assertFile('app/pods/foo/bar/model.js', {
        contains: [
          "import DS from 'ember-data';",
          "export default DS.Model.extend"
        ]
      });
      assertFile('tests/unit/pods/foo/bar/model-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo/bar'"
        ]
      });
    });
  });

  it('in-addon route foo --pod', function() {
    return generateInAddon(['route', 'foo', '--pod']).then(function() {
      assertFile('addon/foo/route.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Route.extend({\n});"
        ]
      });
      assertFile('addon/foo/template.hbs', {
        contains: "{{outlet}}"
      });
      assertFile('app/foo/route.js', {
        contains: [
          "export { default } from 'my-addon/foo/route';"
        ]
      });
      assertFile('app/foo/template.js', {
        contains: [
          "export { default } from 'my-addon/foo/template';"
        ]
      });
      assertFile('tests/unit/foo/route-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('route:foo'"
        ]
      });
    });
  });

  it('route foo --pod', function() {
    return generate(['route', 'foo', '--pod']).then(function() {
      assertFile('app/router.js', {
        contains: 'this.route(\'foo\')'
      });
      assertFile('app/foo/route.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Route.extend({\n});"
        ]
      });
      assertFile('app/foo/template.hbs', {
        contains: '{{outlet}}'
      });
      assertFile('tests/unit/foo/route-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('route:foo'"
        ]
      });
    });
  });

  it('route foo --pod with --path', function() {
    return generate(['route', 'foo', '--pod', '--path=:foo_id/show'])
      .then(function() {
        assertFile('app/router.js', {
          contains: [
            'this.route(\'foo\', {',
            'path: \':foo_id/show\'',
            '});'
          ]
        });
      });
  });

  it('route foo --pod with --reset-namespace', function() {
    return generate(['route', 'foo', '--pod', '--reset-namespace'])
      .then(function() {
        assertFile('app/router.js', {
          contains: [
            'this.route(\'foo\', {',
            'resetNamespace: true',
            '});'
          ]
        });
      });
  });

  it('route foo --pod with --reset-namespace=false', function() {
    return generate(['route', 'foo', '--pod', '--reset-namespace=false'])
      .then(function() {
        assertFile('app/router.js', {
          contains: [
            'this.route(\'foo\', {',
            'resetNamespace: false',
            '});'
          ]
        });
      });
  });

  it('route foo --pod podModulePrefix', function() {
    return generateWithPrefix(['route', 'foo', '--pod']).then(function() {
      assertFile('app/router.js', {
        contains: 'this.route(\'foo\')'
      });
      assertFile('app/pods/foo/route.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Route.extend({\n});"
        ]
      });
      assertFile('app/pods/foo/template.hbs', {
        contains: '{{outlet}}'
      });
      assertFile('tests/unit/pods/foo/route-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('route:foo'"
        ]
      });
    });
  });

  it('route index --pod', function() {
    return generate(['route', 'index', '--pod']).then(function() {
      assertFile('app/router.js', {
        doesNotContain: "this.route('index');"
      });
    });
  });

  it('route application --pod', function() {
    // need to run `initApp` manually here instead of using `generate` helper
    // because we need to remove the templates/application.hbs file to prevent
    // a prompt (due to a conflict)
    return initApp().then(function() {
      remove(path.join('app', 'templates', 'application.hbs'));
    })
    .then(function(){
      return ember(['generate', 'route', 'application', '--pod']);
    })
    .then(function() {
      assertFile('app/router.js', {
        doesNotContain: "this.route('application');"
      });
    });
  });

  it('route basic --pod isn\'t added to router', function() {
    return generate(['route', 'basic', '--pod']).then(function() {
      assertFile('app/router.js', {
        doesNotContain: "this.route('basic');"
      });
      assertFile('app/basic/route.js');
    });
  });

  it('template foo --pod', function() {
    return generate(['template', 'foo', '--pod']).then(function() {
      assertFile('app/foo/template.hbs');
    });
  });

  it('template foo --pod podModulePrefix', function() {
    return generateWithPrefix(['template', 'foo', '--pod']).then(function() {
      assertFile('app/pods/foo/template.hbs');
    });
  });

  it('template foo/bar --pod', function() {
    return generate(['template', 'foo/bar', '--pod']).then(function() {
      assertFile('app/foo/bar/template.hbs');
    });
  });

  it('template foo/bar --pod podModulePrefix', function() {
    return generateWithPrefix(['template', 'foo/bar', '--pod']).then(function() {
      assertFile('app/pods/foo/bar/template.hbs');
    });
  });

  it('view foo --pod', function() {
    return generate(['view', 'foo', '--pod']).then(function() {
      assertFile('app/foo/view.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.View.extend({\n})"
        ]
      });
      assertFile('tests/unit/foo/view-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('view:foo'"
        ]
      });
    });
  });

  it('view foo --pod podModulePrefix', function() {
    return generateWithPrefix(['view', 'foo', '--pod']).then(function() {
      assertFile('app/pods/foo/view.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.View.extend({\n})"
        ]
      });
      assertFile('tests/unit/pods/foo/view-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('view:foo'"
        ]
      });
    });
  });

  it('view foo/bar --pod', function() {
    return generate(['view', 'foo/bar', '--pod']).then(function() {
      assertFile('app/foo/bar/view.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.View.extend({\n})"
        ]
      });
      assertFile('tests/unit/foo/bar/view-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('view:foo/bar'"
        ]
      });
    });
  });

  it('view foo/bar --pod podModulePrefix', function() {
    return generateWithPrefix(['view', 'foo/bar', '--pod']).then(function() {
      assertFile('app/pods/foo/bar/view.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.View.extend({\n})"
        ]
      });
      assertFile('tests/unit/pods/foo/bar/view-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('view:foo/bar'"
        ]
      });
    });
  });

  it('resource foos --pod', function() {
    return generate(['resource', 'foos', '--pod']).then(function() {
      assertFile('app/router.js', {
        contains: 'this.route(\'foos\');'
      });
      assertFile('app/foo/model.js', {
        contains: 'export default DS.Model.extend'
      });
      assertFile('app/foos/route.js', {
        contains: 'export default Ember.Route.extend({\n});'
      });
      assertFile('app/foos/template.hbs', {
        contains: '{{outlet}}'
      });
      assertFile('tests/unit/foo/model-test.js', {
        contains: "moduleForModel('foo'"
      });
      assertFile('tests/unit/foos/route-test.js', {
        contains: "moduleFor('route:foos'"
      });
    });
  });

  it('resource foos --pod with --path', function() {
    return generate(['resource', 'foos', '--pod', '--path=app/foos'])
      .then(function() {
        assertFile('app/router.js', {
          contains: [
            'this.route(\'foos\', {',
            'path: \'app/foos\'',
            '});'
          ]
        });
      });
  });

  it('resource foos --pod with --reset-namespace', function() {
    return generate(['resource', 'foos', '--pod', '--reset-namespace'])
      .then(function() {
        assertFile('app/router.js', {
          contains: [
            'this.route(\'foos\', {',
            'resetNamespace: true',
            '});'
          ]
        });
      });
  });

  it('resource foos --pod with --reset-namespace=false', function() {
    return generate(['resource', 'foos', '--pod', '--reset-namespace=false'])
      .then(function() {
        assertFile('app/router.js', {
          contains: [
            'this.route(\'foos\', {',
            'resetNamespace: false',
            '});'
          ]
        });
      });
  });

  it('resource foos --pod podModulePrefix', function() {
    return generateWithPrefix(['resource', 'foos', '--pod']).then(function() {
      assertFile('app/router.js', {
        contains: 'this.route(\'foos\');'
      });
      assertFile('app/pods/foo/model.js', {
        contains: 'export default DS.Model.extend'
      });
      assertFile('app/pods/foos/route.js', {
        contains: 'export default Ember.Route.extend({\n});'
      });
      assertFile('app/pods/foos/template.hbs', {
        contains: '{{outlet}}'
      });
      assertFile('tests/unit/pods/foo/model-test.js', {
        contains: "moduleForModel('foo'"
      });
      assertFile('tests/unit/pods/foos/route-test.js', {
        contains: "moduleFor('route:foos'"
      });
    });
  });

  it('initializer foo --pod', function() {
    return generate(['initializer', 'foo', '--pod']).then(function() {
      assertFile('app/initializers/foo.js', {
        contains: "export function initialize(/* application */) {\n" +
                  "  // application.inject('route', 'foo', 'service:foo');\n" +
                  "}\n" +
                  "\n"+
                  "export default {\n" +
                  "  name: 'foo',\n" +
                  "  initialize\n" +
                  "};"
      });
    });
  });

  it('initializer foo/bar --pod', function() {
    return generate(['initializer', 'foo/bar', '--pod']).then(function() {
      assertFile('app/initializers/foo/bar.js', {
        contains: "export function initialize(/* application */) {\n" +
                  "  // application.inject('route', 'foo', 'service:foo');\n" +
                  "}\n" +
                  "\n"+
                  "export default {\n" +
                  "  name: 'foo/bar',\n" +
                  "  initialize\n" +
                  "};"
      });
    });
  });

  it('instance-initializer foo --pod', function() {
    return generate(['instance-initializer', 'foo', '--pod']).then(function() {
      assertFile('app/instance-initializers/foo.js', {
        contains: "export function initialize(/* appInstance */) {\n" +
                  "  // appInstance.inject('route', 'foo', 'service:foo');\n" +
                  "}\n" +
                  "\n"+
                  "export default {\n" +
                  "  name: 'foo',\n" +
                  "  initialize: initialize\n" +
                  "};"
      });
    });
  });

  it('instance-initializer foo/bar --pod', function() {
    return generate(['instance-initializer', 'foo/bar', '--pod']).then(function() {
      assertFile('app/instance-initializers/foo/bar.js', {
        contains: "export function initialize(/* appInstance */) {\n" +
                  "  // appInstance.inject('route', 'foo', 'service:foo');\n" +
                  "}\n" +
                  "\n"+
                  "export default {\n" +
                  "  name: 'foo/bar',\n" +
                  "  initialize: initialize\n" +
                  "};"
      });
    });
  });

  it('mixin foo --pod', function() {
    return generate(['mixin', 'foo', '--pod']).then(function() {
      assertFile('app/mixins/foo.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Mixin.create({\n});'
        ]
      });
      assertFile('tests/unit/mixins/foo-test.js', {
        contains: [
          "import FooMixin from 'my-app/mixins/foo';"
        ]
      });
    });
  });

  it('mixin foo/bar --pod', function() {
    return generate(['mixin', 'foo/bar', '--pod']).then(function() {
      assertFile('app/mixins/foo/bar.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Mixin.create({\n});'
        ]
      });
      assertFile('tests/unit/mixins/foo/bar-test.js', {
        contains: [
          "import FooBarMixin from 'my-app/mixins/foo/bar';"
        ]
      });
    });
  });

  it('mixin foo/bar/baz --pod', function() {
    return generate(['mixin', 'foo/bar/baz', '--pod']).then(function() {
      assertFile('tests/unit/mixins/foo/bar/baz-test.js', {
        contains: [
          "import FooBarBazMixin from 'my-app/mixins/foo/bar/baz';"
        ]
      });
    });
  });

  it('adapter application --pod', function() {
    return generate(['adapter', 'application', '--pod']).then(function() {
      assertFile('app/application/adapter.js', {
        contains: [
          "import DS from \'ember-data\';",
          "export default DS.RESTAdapter.extend({\n});"
        ]
      });
      assertFile('tests/unit/application/adapter-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('adapter:application'"
        ]
      });
    });
  });

  it('adapter foo --pod', function() {
    return generate(['adapter', 'foo', '--pod']).then(function() {
      assertFile('app/foo/adapter.js', {
        contains: [
          "import ApplicationAdapter from \'./application\';",
          "export default ApplicationAdapter.extend({\n});"
        ]
      });
      assertFile('tests/unit/foo/adapter-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('adapter:foo'"
        ]
      });
    });
  });

  it('adapter foo --pod podModulePrefix', function() {
    return generateWithPrefix(['adapter', 'foo', '--pod']).then(function() {
      assertFile('app/pods/foo/adapter.js', {
        contains: [
          "import ApplicationAdapter from \'./application\';",
          "export default ApplicationAdapter.extend({\n});"
        ]
      });
      assertFile('tests/unit/pods/foo/adapter-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('adapter:foo'"
        ]
      });
    });
  });

  it('adapter foo/bar --pod', function() {
    return generate(['adapter', 'foo/bar', '--pod']).then(function() {
      assertFile('app/foo/bar/adapter.js', {
        contains: [
          "import ApplicationAdapter from \'../application\';",
          "export default ApplicationAdapter.extend({\n});"
        ]
      });
    });
  });

  it('adapter foo/bar --pod podModulePrefix', function() {
    return generateWithPrefix(['adapter', 'foo/bar', '--pod']).then(function() {
      assertFile('app/pods/foo/bar/adapter.js', {
        contains: [
          "import ApplicationAdapter from \'../application\';",
          "export default ApplicationAdapter.extend({\n});"
        ]
      });
    });
  });

  it('adapter application cannot extend from --base-class=application', function() {
    return generate(['adapter', 'application', '--base-class=application', '--pod']).then(function() {
      expect(false).to.be.ok;
    }, function(err) {
      expect(err.errorLog[0]).to.match(/Adapters cannot extend from themself/);
    });
  });

  it('adapter foo cannot extend from --base-class=foo', function() {
    return generate(['adapter', 'foo', '--base-class=foo', '--pod']).then(function() {
      expect(false).to.be.ok;
    }, function(err) {
      expect(err.errorLog[0]).to.match(/Adapters cannot extend from themself/);
    });
  });

  it('adapter --pod extends from --base-class=bar', function() {
    return generate(['adapter', 'foo', '--base-class=bar', '--pod']).then(function() {
      assertFile('app/foo/adapter.js', {
        contains: [
          "import BarAdapter from './bar';",
          "export default BarAdapter.extend({\n});"
        ]
      });
    });
  });

  it('adapter --pod extends from --base-class=foo/bar', function() {
    return generate(['adapter', 'foo/baz', '--base-class=foo/bar', '--pod']).then(function() {
      assertFile('app/foo/baz/adapter.js', {
        contains: [
          "import FooBarAdapter from '../foo/bar';",
          "export default FooBarAdapter.extend({\n});"
        ]
      });
    });
  });

  it('adapter --pod extends from application adapter if present', function() {
    return preGenerate(['adapter', 'application']).then(function() {
      return generate(['adapter', 'foo', '--pod']).then(function() {
        assertFile('app/foo/adapter.js', {
          contains: [
            "import ApplicationAdapter from './application';",
            "export default ApplicationAdapter.extend({\n});"
          ]
        });
      });
    });
  });

  it('adapter --pod favors  --base-class over  application', function() {
    return preGenerate(['adapter', 'application']).then(function() {
      return generate(['adapter', 'foo', '--base-class=bar', '--pod']).then(function() {
        assertFile('app/foo/adapter.js', {
          contains: [
            "import BarAdapter from './bar';",
            "export default BarAdapter.extend({\n});"
          ]
        });
      });
    });
  });

  it('serializer foo --pod', function() {
    return generate(['serializer', 'foo', '--pod']).then(function() {
      assertFile('app/foo/serializer.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.RESTSerializer.extend({\n});'
        ]
      });
      assertFile('tests/unit/foo/serializer-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
        ]
      });
    });
  });

  it('serializer foo --pod podModulePrefix', function() {
    return generateWithPrefix(['serializer', 'foo', '--pod']).then(function() {
      assertFile('app/pods/foo/serializer.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.RESTSerializer.extend({\n});'
        ]
      });
      assertFile('tests/unit/pods/foo/serializer-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
        ]
      });
    });
  });

  it('serializer foo/bar --pod', function() {
    return generate(['serializer', 'foo/bar', '--pod']).then(function() {
      assertFile('app/foo/bar/serializer.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.RESTSerializer.extend({\n});'
        ]
      });
      assertFile('tests/unit/foo/bar/serializer-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo/bar'"
        ]
      });
    });
  });

  it('serializer foo/bar --pod podModulePrefix', function() {
    return generateWithPrefix(['serializer', 'foo/bar', '--pod']).then(function() {
      assertFile('app/pods/foo/bar/serializer.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.RESTSerializer.extend({\n});'
        ]
      });
      assertFile('tests/unit/pods/foo/bar/serializer-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo/bar'"
        ]
      });
    });
  });

  it('transform foo --pod', function() {
    return generate(['transform', 'foo', '--pod']).then(function() {
      assertFile('app/foo/transform.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.Transform.extend({\n' +
          '  deserialize(serialized) {\n' +
          '    return serialized;\n' +
          '  },\n' +
          '\n' +
          '  serialize(deserialized) {\n' +
          '    return deserialized;\n' +
          '  }\n' +
          '});'
        ]
      });
      assertFile('tests/unit/foo/transform-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('transform:foo'"
        ]
      });
    });
  });

  it('transform foo --pod podModulePrefix', function() {
    return generateWithPrefix(['transform', 'foo', '--pod']).then(function() {
      assertFile('app/pods/foo/transform.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.Transform.extend({\n' +
          '  deserialize(serialized) {\n' +
          '    return serialized;\n' +
          '  },\n' +
          '\n' +
          '  serialize(deserialized) {\n' +
          '    return deserialized;\n' +
          '  }\n' +
          '});'
        ]
      });
      assertFile('tests/unit/pods/foo/transform-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('transform:foo'"
        ]
      });
    });
  });

  it('transform foo/bar --pod', function() {
    return generate(['transform', 'foo/bar', '--pod']).then(function() {
      assertFile('app/foo/bar/transform.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.Transform.extend({\n' +
          '  deserialize(serialized) {\n' +
          '    return serialized;\n' +
          '  },\n' +
          '\n' +
          '  serialize(deserialized) {\n' +
          '    return deserialized;\n' +
          '  }\n' +
          '});'
        ]
      });
      assertFile('tests/unit/foo/bar/transform-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('transform:foo/bar'"
        ]
      });
    });
  });

  it('transform foo/bar --pod podModulePrefix', function() {
    return generateWithPrefix(['transform', 'foo/bar', '--pod']).then(function() {
      assertFile('app/pods/foo/bar/transform.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.Transform.extend({\n' +
          '  deserialize(serialized) {\n' +
          '    return serialized;\n' +
          '  },\n' +
          '\n' +
          '  serialize(deserialized) {\n' +
          '    return deserialized;\n' +
          '  }\n' +
          '});'
        ]
      });
      assertFile('tests/unit/pods/foo/bar/transform-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('transform:foo/bar'"
        ]
      });
    });
  });

  it('util foo-bar --pod', function() {
    return generate(['util', 'foo-bar', '--pod']).then(function() {
      assertFile('app/utils/foo-bar.js', {
        contains: 'export default function fooBar() {\n' +
                  '  return true;\n' +
                  '}'
      });
      assertFile('tests/unit/utils/foo-bar-test.js', {
        contains: [
          "import fooBar from 'my-app/utils/foo-bar';"
        ]
      });
    });
  });

  it('util foo-bar/baz --pod', function() {
    return generate(['util', 'foo/bar-baz', '--pod']).then(function() {
      assertFile('app/utils/foo/bar-baz.js', {
        contains: 'export default function fooBarBaz() {\n' +
                  '  return true;\n' +
                  '}'
      });
      assertFile('tests/unit/utils/foo/bar-baz-test.js', {
        contains: [
          "import fooBarBaz from 'my-app/utils/foo/bar-baz';"
        ]
      });
    });
  });

  it('service foo --pod', function() {
    return generate(['service', 'foo', '--pod']).then(function() {
      assertFile('app/foo/service.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Service.extend({\n});'
        ]
      });
      assertFile('tests/unit/foo/service-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('service:foo'"
        ]
      });
    });
  });

  it('service foo/bar --pod', function() {
    return generate(['service', 'foo/bar', '--pod']).then(function() {
      assertFile('app/foo/bar/service.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Service.extend({\n});'
        ]
      });
      assertFile('tests/unit/foo/bar/service-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('service:foo/bar'"
        ]
      });
    });
  });

  it('service foo --pod podModulePrefix', function() {
    return generateWithPrefix(['service', 'foo', '--pod']).then(function() {
      assertFile('app/pods/foo/service.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Service.extend({\n});'
        ]
      });
      assertFile('tests/unit/pods/foo/service-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('service:foo'"
        ]
      });
    });
  });

  it('service foo/bar --pod podModulePrefix', function() {
    return generateWithPrefix(['service', 'foo/bar', '--pod']).then(function() {
      assertFile('app/pods/foo/bar/service.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Service.extend({\n});'
        ]
      });
      assertFile('tests/unit/pods/foo/bar/service-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('service:foo/bar'"
        ]
      });
    });
  });

  it('blueprint foo --pod', function() {
    return generate(['blueprint', 'foo', '--pod']).then(function() {
      assertFile('blueprints/foo/index.js', {
        contains: "module.exports = {\n" +
                  "  description: ''\n" +
                  "\n" +
                  "  // locals: function(options) {\n" +
                  "  //   // Return custom template variables here.\n" +
                  "  //   return {\n" +
                  "  //     foo: options.entity.options.foo\n" +
                  "  //   };\n" +
                  "  // }\n" +
                  "\n" +
                  "  // afterInstall: function(options) {\n" +
                  "  //   // Perform extra work here.\n" +
                  "  // }\n" +
                  "};"
      });
    });
  });

  it('blueprint foo/bar --pod', function() {
    return generate(['blueprint', 'foo/bar', '--pod']).then(function() {
      assertFile('blueprints/foo/bar/index.js', {
        contains: "module.exports = {\n" +
                  "  description: ''\n" +
                  "\n" +
                  "  // locals: function(options) {\n" +
                  "  //   // Return custom template variables here.\n" +
                  "  //   return {\n" +
                  "  //     foo: options.entity.options.foo\n" +
                  "  //   };\n" +
                  "  // }\n" +
                  "\n" +
                  "  // afterInstall: function(options) {\n" +
                  "  //   // Perform extra work here.\n" +
                  "  // }\n" +
                  "};"
      });
    });
  });

  it('http-mock foo --pod', function() {
    return generate(['http-mock', 'foo', '--pod']).then(function() {
      assertFile('server/index.js', {
        contains:"mocks.forEach(function(route) { route(app); });"
      });
      assertFile('server/mocks/foo.js', {
        contains: "module.exports = function(app) {\n" +
                  "  var express = require('express');\n" +
                  "  var fooRouter = express.Router();\n" +
                  "\n" +
                  "  fooRouter.get('/', function(req, res) {\n" +
                  "    res.send({\n" +
                  "      'foo': []\n" +
                  "    });\n" +
                  "  });\n" +
                  "\n" +
                  "  fooRouter.post('/', function(req, res) {\n" +
                  "    res.status(201).end();\n" +
                  "  });\n" +
                  "\n" +
                  "  fooRouter.get('/:id', function(req, res) {\n" +
                  "    res.send({\n" +
                  "      'foo': {\n" +
                  "        id: req.params.id\n" +
                  "      }\n" +
                  "    });\n" +
                  "  });\n" +
                  "\n" +
                  "  fooRouter.put('/:id', function(req, res) {\n" +
                  "    res.send({\n" +
                  "      'foo': {\n" +
                  "        id: req.params.id\n" +
                  "      }\n" +
                  "    });\n" +
                  "  });\n" +
                  "\n" +
                  "  fooRouter.delete('/:id', function(req, res) {\n" +
                  "    res.status(204).end();\n" +
                  "  });\n" +
                  "\n" +
                  "  // The POST and PUT call will not contain a request body\n" +
                  "  // because the body-parser is not included by default.\n" +
                  "  // To use req.body, run:\n" +
                  "\n" +
                  "  //    npm install --save-dev body-parser\n" +
                  "\n" +
                  "  // After installing, you need to `use` the body-parser for\n" +
                  "  // this mock uncommenting the following line:\n" +
                  "  //\n" +
                  "  //app.use('/api/foo', require('body-parser').json());\n" +
                  "  app.use('/api/foo', fooRouter);\n" +
                  "};"
      });
      assertFile('server/.jshintrc', {
        contains: '{\n  "node": true\n}'
      });
    });
  });

  it('http-mock foo-bar --pod', function() {
    return generate(['http-mock', 'foo-bar', '--pod']).then(function() {
      assertFile('server/index.js', {
        contains: "mocks.forEach(function(route) { route(app); });"
      });
      assertFile('server/mocks/foo-bar.js', {
        contains: "module.exports = function(app) {\n" +
                  "  var express = require('express');\n" +
                  "  var fooBarRouter = express.Router();\n" +
                  "\n" +
                  "  fooBarRouter.get('/', function(req, res) {\n" +
                  "    res.send({\n" +
                  "      'foo-bar': []\n" +
                  "    });\n" +
                  "  });\n" +
                  "\n" +
                  "  fooBarRouter.post('/', function(req, res) {\n" +
                  "    res.status(201).end();\n" +
                  "  });\n" +
                  "\n" +
                  "  fooBarRouter.get('/:id', function(req, res) {\n" +
                  "    res.send({\n" +
                  "      'foo-bar': {\n" +
                  "        id: req.params.id\n" +
                  "      }\n" +
                  "    });\n" +
                  "  });\n" +
                  "\n" +
                  "  fooBarRouter.put('/:id', function(req, res) {\n" +
                  "    res.send({\n" +
                  "      'foo-bar': {\n" +
                  "        id: req.params.id\n" +
                  "      }\n" +
                  "    });\n" +
                  "  });\n" +
                  "\n" +
                  "  fooBarRouter.delete('/:id', function(req, res) {\n" +
                  "    res.status(204).end();\n" +
                  "  });\n" +
                  "\n" +
                  "  // The POST and PUT call will not contain a request body\n" +
                  "  // because the body-parser is not included by default.\n" +
                  "  // To use req.body, run:\n" +
                  "\n" +
                  "  //    npm install --save-dev body-parser\n" +
                  "\n" +
                  "  // After installing, you need to `use` the body-parser for\n" +
                  "  // this mock uncommenting the following line:\n" +
                  "  //\n" +
                  "  //app.use('/api/foo-bar', require('body-parser').json());\n" +
                  "  app.use('/api/foo-bar', fooBarRouter);\n" +
                  "};"
      });
      assertFile('server/.jshintrc', {
        contains: '{\n  "node": true\n}'
      });
    });
  });

  it('http-proxy foo --pod', function() {
    return generate(['http-proxy', 'foo', 'http://localhost:5000', '--pod']).then(function() {
      assertFile('server/index.js', {
        contains: "proxies.forEach(function(route) { route(app); });"
      });
      assertFile('server/proxies/foo.js', {
        contains: "var proxyPath = '/foo';\n" +
                  "\n" +
                  "module.exports = function(app) {\n" +
                  "  // For options, see:\n" +
                  "  // https://github.com/nodejitsu/node-http-proxy\n" +
                  "  var proxy = require('http-proxy').createProxyServer({});\n" +
                  "\n" +
                  "  proxy.on('error', function(err, req) {\n" +
                  "    console.error(err, req.url);\n" +
                  "  });\n" +
                  "\n" +
                  "  app.use(proxyPath, function(req, res, next){\n" +
                  "    // include root path in proxied request\n" +
                  "    req.url = proxyPath + '/' + req.url;\n" +
                  "    proxy.web(req, res, { target: 'http://localhost:5000' });\n" +
                  "  });\n" +
                  "};"
      });
      assertFile('server/.jshintrc', {
        contains: '{\n  "node": true\n}'
      });
    });
  });

  it('in-addon component x-foo --pod', function() {
    return generateInAddon(['component', 'x-foo', '--pod']).then(function() {
      assertFile('addon/components/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "import layout from './template';",
          "export default Ember.Component.extend({",
          "layout",
          "});"
        ]
      });
      assertFile('addon/components/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('app/components/x-foo/component.js', {
        contains: [
          "export { default } from 'my-addon/components/x-foo/component';"
        ]
      });
      assertFile('tests/integration/components/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "moduleForComponent('x-foo'",
          "integration: true"
        ]
      });
    });
  });

  it('in-repo-addon component x-foo --pod', function() {
    return generateInRepoAddon(['component', 'x-foo', '--in-repo-addon=my-addon', '--pod']).then(function() {
      assertFile('lib/my-addon/addon/components/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "import layout from './template';",
          "export default Ember.Component.extend({",
          "layout",
          "});"
        ]
      });
      assertFile('lib/my-addon/addon/components/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('lib/my-addon/app/components/x-foo/component.js', {
        contains: [
          "export { default } from 'my-addon/components/x-foo/component';"
        ]
      });
      assertFile('tests/integration/components/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "moduleForComponent('x-foo'",
          "integration: true"
        ]
      });
    });
  });

  it('in-repo-addon component nested/x-foo', function() {
    return generateInRepoAddon(['component', 'nested/x-foo', '--in-repo-addon=my-addon', '--pod']).then(function() {
      assertFile('lib/my-addon/addon/components/nested/x-foo/component.js', {
        contains: [
          "import Ember from 'ember';",
          "import layout from './template';",
          "export default Ember.Component.extend({",
          "layout",
          "});"
        ]
      });
      assertFile('lib/my-addon/addon/components/nested/x-foo/template.hbs', {
        contains: "{{yield}}"
      });
      assertFile('lib/my-addon/app/components/nested/x-foo/component.js', {
        contains: [
          "export { default } from 'my-addon/components/nested/x-foo/component';"
        ]
      });
      assertFile('tests/integration/components/nested/x-foo/component-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "moduleForComponent('nested/x-foo'",
          "integration: true"
        ]
      });
    });
  });

  it('uses blueprints from the project directory', function() {
    return initApp()
      .then(function() {
        return outputFile(
          'blueprints/foo/files/app/foos/__name__.js',
          "import Ember from 'ember';\n" +
          'export default Ember.Object.extend({ foo: true });\n'
        );
      })
      .then(function() {
        return ember(['generate', 'foo', 'bar', '--pod']);
      })
      .then(function() {
        assertFile('app/foos/bar.js', {
          contains: 'foo: true'
        });
      });
  });

  it('allows custom blueprints to override built-ins', function() {
    return initApp()
      .then(function() {
        return outputFile(
          'blueprints/controller/files/app/__path__/__name__.js',
          "import Ember from 'ember';\n\n" +
          "export default Ember.Controller.extend({ custom: true });\n"
        );
      })
      .then(function() {
        return ember(['generate', 'controller', 'foo', '--pod']);
      })
      .then(function() {
        assertFile('app/foo/controller.js', {
          contains: 'custom: true'
        });
      });
  });

  it('passes custom cli arguments to blueprint options', function() {
    return initApp()
      .then(function() {
        return outputFile(
          'blueprints/customblue/files/app/__name__.js',
          "Q: Can I has custom command? A: <%= hasCustomCommand %>"
        );
      })
      .then(function() {
        return outputFile(
          'blueprints/customblue/index.js',
          "module.exports = {\n" +
          "  fileMapTokens: function(options) {\n" +
          "    return {\n" +
          "      __name__: function(options) {\n" +
          "         return options.dasherizedModuleName;\n" +
          "      }\n" +
          "    };\n" +
          "  },\n" +
          "  locals: function(options) {\n" +
          "    var loc = {};\n" +
          "    loc.hasCustomCommand = (options.customCommand) ? 'Yes!' : 'No. :C';\n" +
          "    return loc;\n" +
          "  },\n" +
          "};\n"
        );
      })
      .then(function() {
        return ember(['generate', 'customblue', 'foo', '--custom-command', '--pod']);
      })
      .then(function() {
        assertFile('app/foo.js', {
          contains: 'A: Yes!'
        });
      });
  });

  it('acceptance-test foo', function() {
    return generate(['acceptance-test', 'foo', '--pod']).then(function() {
      var expected = path.join(__dirname, '../fixtures/generate/acceptance-test-expected.js');

      assertFileEquals('tests/acceptance/foo-test.js', expected);
    });
  });

  it('correctly identifies the root of the project', function() {
    return initApp()
      .then(function() {
        return outputFile(
          'blueprints/controller/files/app/__path__/__name__.js',
          "import Ember from 'ember';\n\n" +
          "export default Ember.Controller.extend({ custom: true });\n"
        );
      })
      .then(function() {
        process.chdir(path.join(tmpdir, 'app'));
      })
      .then(function() {
        return ember(['generate', 'controller', 'foo', '--pod']);
      })
      .then(function() {
        process.chdir(tmpdir);
      })
      .then(function() {
        assertFile('app/foo/controller.js', {
          contains: 'custom: true'
        });
      });
  });

  // Skip until podModulePrefix is deprecated
  it.skip('podModulePrefix deprecation warning', function() {
    return generateWithPrefix(['controller', 'foo', '--pod']).then(function(result) {
      expect(result.outputStream.join()).to.include("`podModulePrefix` is deprecated and will be"+
      " removed from future versions of ember-cli. Please move existing pods from"+
      " 'app/pods/' to 'app/'.");
    });
  });

  it('usePodsByDefault deprecation warning', function() {
    return generateWithUsePodsDeprecated(['controller', 'foo', '--pod']).then(function(result) {
      expect(result.outputStream.join()).to.include('`usePodsByDefault` is no longer supported in'+
        ' \'config/environment.js\', use `usePods` in \'.ember-cli\' instead.');
    });
  });

  it('route foo --dry-run --pod does not change router.js', function() {
    return generate(['route', 'foo', '--dry-run', '--pod']).then(function() {
      assertFile('app/router.js', {
        doesNotContain: "route('foo')"
      });
    });
  });

  it('availableOptions work with aliases.', function() {
    return generate(['route', 'foo', '-d', '-p']).then(function() {
      assertFile('app/router.js', {
        doesNotContain: "route('foo')"
      });
    });
  });
});