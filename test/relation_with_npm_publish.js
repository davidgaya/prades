'use strict';

var promisify = require('../lib/promisify');
var exec = promisify(require('child_process').exec);
var assert = require('assert');
var fs = require('fs');
var writeFile = promisify(fs.writeFile);

/* this are the fs fixtures
 ├── install
 │   └── package.json
 ├── linked_lib
 │   ├── linked_dir
 │   │   └── linked_file.txt
 │   └── linked_file.txt
 └── publish
     ├── boost
     │   ├── boost
     │   │   └── david_test_2.txt
     │   ├── dont_pack.this
     │   ├── linked_dir -> ../../linked_lib/linked_dir
     │   ├── linked_file.txt -> ../../linked_lib/linked_file.txt
     │   └── stage
     │       └── david_test.txt
     ├── extra_readme.md
     ├── index.js
     ├── package.json
     └── Readme.md
*/

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

describe("relation with npm publish", function () {
    this.timeout(8000);

    before(function(done) {
      writePackageJson(packageJson).then(done).catch(console.log);
    });

    describe("npm package is not published", function () {

        before(function (done) {
            npm_unpublish().then(done).catch(console.log);
        });

        it("can publish binaries", function (done) {
            publish().then(done).catch(console.log);
        });
    });

    describe("npm package is published", function () {

        before(function (done) {
            npm_publish().then(done).catch(console.log);
        });

        it("cannot publish binaries", function (done) {
            publish().then(function () {
                done(new Error("Publish should fail and it didn't"));
            }, function () {
                done();
            });
        });

        it("cannot unpublish binaries", function (done) {
            unpublish().then(function () {
                done(new Error("Unpublish should fail and it didn't"));
            }, function () {
                done();
            });
        });
    });

});

function writePackageJson(conf) {
    return writeFile("./test/publish/package.json", JSON.stringify(conf));
}

function publish() {
    return exec("node ../../bin/cli.js publish", {cwd: 'test/publish'}).then(() => {});
}

function unpublish() {
    return exec("node ../../bin/cli.js unpublish", {cwd: 'test/publish'}).then(() => {});
}

function npm_publish() {
    return exec("npm publish", {cwd: 'test/publish'}).then(() => {});
}

function npm_unpublish() {
    return exec("npm unpublish -f", {cwd: 'test/publish'}).then(() => {});
}

function install() {
    return exec("node ../../bin/cli.js install", {cwd: 'test/install'});
}
