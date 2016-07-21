/*
 See doc/package_json.md
   prades publish should give error if you are trying to publish a binary for an ignored platform.
   prades install should do nothing (maybe only info message) if it is an ignored platform.
 */

'use strict';
require('./utils')(); /* globals writePackageJson, writeInstallPackageJson, publish, unpublish, npm_publish, npm_unpublish, install, clean_install_dir, assert_exists, assert_not_exists */

const assert = require('assert');

describe('os and cpu options', function () {
    this.timeout(8000);

    before(function (done) {
        writePackageJson({"name": "@sb/prades_test_1", "version": "0.0.01"})
            .then(npm_unpublish).then(done).catch(console.log);
    });

    after(function (done) {
        clean_install_dir().then(done,done);
    });

    // publish should give error if you are trying to publish a binary for an ignored platform.
    describe('publish', function () {
        it('works if there is no os or cpu', function (done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases"
                }
            };
            writePackageJson(packageJson)
                .then(publish)
                .then(done, done);
        });
        it('works if the os and cpu are enabled', function (done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases",
                    "os": [process.platform],
                    "cpu": [process.arch]
                }
            };
            writePackageJson(packageJson)
                .then(publish)
                .then(done, done);
        });
        it('gives an error if the os in NOT enabled', function (done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases",
                    "os": ["martian"],
                    "cpu": [process.arch]
                }
            };
            writePackageJson(packageJson)
                .then(publish)
                .then(function () {
                    done(new Error("Publish should fail and it didn't"));
                }, function () {
                    done();
                });
        });
        it('gives an error if the cpu in NOT enabled', function (done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases",
                    "os": [process.platform],
                    "cpu": ["martian"]
                }
            };
            writePackageJson(packageJson)
                .then(publish)
                .then(function () {
                    done(new Error("Publish should fail and it didn't"));
                }, function () {
                    done();
                });
        });
    });

    // install should do nothing (maybe only info message) if it is an ignored platform.
    describe("install", function () {

        beforeEach(function (done) {
            clean_install_dir().then(done, done);
        });

        before(function(done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases"
                }
            };
            writePackageJson(packageJson)
                .then(publish)
                .then(done, done);
        });
        it('installs if there is no os or cpu', function (done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases"
                }
            };
            writeInstallPackageJson(packageJson)
                .then(install)
                .then(() => assert_exists("./test/install/boost"))
                .then(done, done);
        });
        it('installs if the os and cpu are enabled', function (done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases",
                    "os": [process.platform],
                    "cpu": [process.arch]
                }
            };
            writeInstallPackageJson(packageJson)
                .then(install)
                .then(() => assert_exists("./test/install/boost"))
                .then(done, done);
        });
        it('skips install if the os in NOT enabled', function (done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases",
                    "os": ["martian"],
                    "cpu": [process.arch]
                }
            };
            writeInstallPackageJson(packageJson)
                .then(install)
                .then(() => assert_not_exists("./test/install/boost"))
                .then(done, done);
        });
        it('skips install if the cpu in NOT enabled', function (done) {
            var packageJson = {
                "name": "@sb/prades_test_1",
                "version": "0.0.01",
                "binary": {
                    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
                    "path": ["boost/**"],
                    "host": "https://registry-node.starbreeze.com/-/releases",
                    "os": [process.platform],
                    "cpu": ["martian"]
                }
            };
            writeInstallPackageJson(packageJson)
                .then(install)
                .then(() => assert_not_exists("./test/install/boost"))
                .then(done, done);
        });
    });
});
