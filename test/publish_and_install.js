'use strict';

require('./utils')(); /* globals writePackageJson, publish, unpublish, npm_publish, npm_unpublish, install, clean_install_dir, assert_exists, assert_not_exists */
var assert = require('assert');

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

describe("publish and install", function () {
    this.timeout(8000);

    before(function (done) {
        writePackageJson({"name": "@sb/prades_test_1", "version": "0.0.01"})
            .then(npm_unpublish).then(done).catch(console.log);
    });

    beforeEach(function (done) {
        clean_install_dir().then(done, done);
    });

    after(function (done) {
        clean_install_dir().then(done,done);
    });

    it("first example", function (done) {
        var packageJson = {
            "name": "@sb/prades_test_1",
            "version": "0.0.01",
            "dependencies": {
                "@sb/prades": "file:../.."
            },
            "binary": {
                "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                "path": [
                    "boost/**",
                    "extra_readme.md",
                    "!boost/dont_pack.this"
                ],
                "host": "https://registry-node.starbreeze.com/-/releases"
            },
            "license": "ISC", "repository": "."
        };
        writePackageJson(packageJson)
        .then(unpublish)
        .then(publish)
        .then(install)
        .then(function () {
            assert_exists("./test/install/package.json");
            assert_exists("./test/install/extra_readme.md");
            assert_exists("./test/install/boost");
            assert_exists("./test/install/boost/boost");
            assert_exists("./test/install/boost/stage");
            assert_exists("./test/install/boost/linked_dir");
            assert_exists("./test/install/boost/linked_file.txt");
            assert_exists("./test/install/boost/boost/david_test_2.txt");
            assert_exists("./test/install/boost/stage/david_test.txt");
            assert_exists("./test/install/boost/linked_dir/linked_file.txt");
            assert_not_exists("./test/install/boost/dont_pack.this");
        })
        .then(done, done);
    });

    it("second example", function (done) {
        var packageJson = {
            "name": "@sb/prades_test_1",
            "version": "0.0.01",
            "dependencies": {
                "@sb/prades": "file:../.."
            },
            "binary": {
                "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                "path": [
                    "boost",
                    "boost/linked_file.txt",
                    "boost/linked_dir/**",
                    "extra_readme.md",
                    "boost/boost/**",
                    "boost/stage/**"
                ],
                "host": "https://registry-node.starbreeze.com/-/releases"
            },
            "license": "ISC", "repository": "."
        };
        writePackageJson(packageJson)
        .then(unpublish)
        .then(publish)
        .then(install)
        .then(function () {
            assert_exists("./test/install/package.json");
            assert_exists("./test/install/extra_readme.md");
            assert_exists("./test/install/boost");
            assert_exists("./test/install/boost/boost");
            assert_exists("./test/install/boost/stage");
            assert_exists("./test/install/boost/linked_dir");
            assert_exists("./test/install/boost/linked_file.txt");
            assert_exists("./test/install/boost/boost/david_test_2.txt");
            assert_exists("./test/install/boost/stage/david_test.txt");
            assert_exists("./test/install/boost/linked_dir/linked_file.txt");
            assert_not_exists("./test/install/boost/dont_pack.this");
        })
        .then(done, done);
    });

    it("third example", function (done) {
        var packageJson = {
            "name": "@sb/prades_test_1",
            "version": "0.0.01",
            "dependencies": {
                "@sb/prades": "file:../.."
            },
            "binary": {
                "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                "path": [
                    "boost",
                    "boost/boost/**",
                    "boost/stage/**"
                ],
                "host": "https://registry-node.starbreeze.com/-/releases"
            },
            "license": "ISC", "repository": "."
        };
        writePackageJson(packageJson)
        .then(unpublish)
        .then(publish)
        .then(install)
        .then(function () {
            assert_exists("./test/install/package.json");
            assert_not_exists("./test/install/extra_readme.md");
            assert_exists("./test/install/boost");
            assert_exists("./test/install/boost/boost");
            assert_exists("./test/install/boost/stage");
            assert_not_exists("./test/install/boost/linked_dir");
            assert_not_exists("./test/install/boost/linked_file.txt");
            assert_exists("./test/install/boost/boost/david_test_2.txt");
            assert_exists("./test/install/boost/stage/david_test.txt");
            assert_not_exists("./test/install/boost/linked_dir/linked_file.txt");
            assert_not_exists("./test/install/boost/dont_pack.this");
        })
        .then(done, done);
    });

    it("fourth example", function (done) {
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
        writePackageJson(packageJson)
        .then(unpublish)
        .then(publish)
        .then(install)
        .then(function () {
            assert_exists("./test/install/package.json");
            assert_not_exists("./test/install/extra_readme.md");
            assert_exists("./test/install/boost");
            assert_exists("./test/install/boost/boost");
            assert_exists("./test/install/boost/stage");
            assert_exists("./test/install/boost/linked_dir");
            assert_exists("./test/install/boost/linked_file.txt");
            assert_exists("./test/install/boost/boost/david_test_2.txt");
            assert_exists("./test/install/boost/stage/david_test.txt");
            assert_exists("./test/install/boost/linked_dir/linked_file.txt");
            assert_exists("./test/install/boost/dont_pack.this");
        })
        .then(done, done);
    });

    it("fifth example, no binary section in package.json", function (done) {
        var packageJson = {
            "name": "@sb/prades_test_1",
            "version": "0.0.01",
            "dependencies": {
                "@sb/prades": "file:../.."
            },
            "license": "ISC", "repository": "."
        };
        writePackageJson(packageJson)
        .then(unpublish)
        .then(publish)
        .then(function resolve(val) {
            done("Should have failed and it didn't.");
        }, function reject(reason) {
            assert.ok(
                /binary section is missing/.test(reason.message),
                "Should give a clear message that binary section is missing"
            );
            done();
        }).catch(console.log);
    });

    it("unpublish example", function (done) {
        var packageJson = {
            "name": "@sb/prades_test_1",
            "version": "0.0.01",
            "dependencies": {
                "@sb/prades": "file:../.."
            },
            "binary": {
                "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                "path": ["boost/nothing"],
                "host": "https://registry-node.starbreeze.com/-/releases"
            },
            "license": "ISC", "repository": "."
        };
        writePackageJson(packageJson)
        .then(unpublish)
        .then(done)
        .catch(console.log);
    });

});
