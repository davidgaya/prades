'use strict';

require('./utils')(); /* globals std_package_json, writePublishPackageJson, publish, unpublish, npm_publish, npm_unpublish, show_info */
var assert = require('assert');

describe("prades info", function () {
    this.timeout(process.env.TIMEOUT || 8000);

    before(() =>
      writePublishPackageJson(std_package_json()).then(npm_unpublish).then(unpublish)
    );

    describe("nothing is published", function () {
        it("shows nothing is published", () =>
            show_info().then(function (output) {
                assert.ok(/not published/.test(output));
            })
        );
    });

    describe("npm package is published, but prades is not", function () {

        before( npm_publish );
        after( npm_unpublish );
        it("shows npm info", () =>
            show_info().then(function (output) {
                assert.ok(/@sb\/prades_test_1/.test(output));
                assert.ok(/0\.0\.1/.test(output));
            })
        );
    });

    describe("prades package is published, but npm is not", function () {

        before(() =>
            publish()
        );

        it("shows prades info", () =>
            show_info().then(function (output) {
                var regExp = new RegExp("-" + process.platform + "-" + process.arch + ".tar.gz");
                assert.ok(regExp.test(output), "binary does not exist");
                assert.ok(/0\.0\.1/.test(output), "version does not exist");
            })
        );

        after(() =>
            unpublish()
        );
    });

});
