'use strict';

require('./utils')(); /* globals std_package_json, writePublishPackageJson, publish, unpublish, npm_unpublish, show_info */
var assert = require('assert');

describe("prades force platform", function () {
    this.timeout(process.env.TIMEOUT || 8000);

    before(() =>
      writePublishPackageJson(std_package_json()).then(npm_unpublish).then(unpublish)
    );

    describe("prades publish for a any platform", function () {

        before(() =>
            publish('--platform martian')
        );

        after(() =>
            unpublish('--platform martian')
        );

        it("shows prades info", () =>
            show_info().then(function (output) {
                var regExp = new RegExp("-" + "martian" + "-" + process.arch + ".tar.gz");
                assert.ok(regExp.test(output), "binary does not exist");
                assert.ok(/0\.0\.1/.test(output), "version does not exist");
            })
        );

    });

});
