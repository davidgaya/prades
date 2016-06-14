'use strict';

require('./utils')(); /* globals writePackageJson, publish, unpublish, npm_publish, npm_unpublish, install, clean_install_dir, assert_exists, assert_not_exists, show_info */
var assert = require('assert');

var packageJson = {
    "name": "@sb/prades_test_1",
    "version": "0.0.01",
    "dependencies": {
        "@sb/prades": "file:../.."
    },
    "binary": {
        "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
        "path": [
            "boost/**"
        ],
        "host": "https://registry-node.starbreeze.com/-/releases"
    },
    "license": "ISC", "repository": "."
};

describe("prades info", function () {
    this.timeout(8000);

    before(function(done) {
      writePackageJson(packageJson)
          .then(npm_unpublish).then(unpublish).then(done).catch(console.log);
    });

    describe("nothing is published", function () {

        it("shows nothing is published", function (done) {
            show_info().then(function (output) {
                assert.ok(/not published/.test(output));
                done();
            }).catch((reason) => {console.log(reason); done(reason);});
        });
    });

    describe("npm package is published, but prades is not", function () {

        before(function (done) {
            npm_publish().then(done).catch(console.log);
        });

        it("shows npm info", function (done) {
            show_info().then(function (output) {
                assert.ok(/\@sb\/prades_test_1/.test(output));
                assert.ok(/0\.0\.1/.test(output));
                done();
            }).catch((reason) => {console.log(reason); done(reason);});
        });

        after(function(done) {
            npm_unpublish().then(done).catch(console.log);
        });
    });

    describe("prades package is published, but npm is not", function () {

        before(function (done) {
            publish().then(done).catch(console.log);
        });

        it("shows prades info", function (done) {
            show_info().then(function (output) {
                assert.ok(/node_46\-linux\-x64\.tar\.gz/.test(output), "binary does not exist");
                assert.ok(/0\.0\.1/.test(output), "version does not exist");
                done();
            }).catch((reason) => {console.log(reason); done(reason);});
        });

        after(function(done) {
            unpublish().then(done).catch(console.log);
        });
    });

});
