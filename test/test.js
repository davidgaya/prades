'use strict';

var promisify = require('../lib/promisify');
var exec = promisify(require('child_process').exec);
var assert = require('assert');
var fs = require('fs');
var writeFile = promisify(fs.writeFile);

describe("publish and install", function () {
    this.timeout(7000);

    beforeEach(function (done) {
        clean_install_dir().then(done, done);
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
            }
        };
        writePackageJson(packageJson)
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
                }
            };
        writePackageJson(packageJson)
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
                }
            };
        writePackageJson(packageJson)
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
                }
            };
        writePackageJson(packageJson)
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

});

function clean_install_dir() {
    return exec("rm -Rf boost/ extra_readme.md", {cwd: 'test/install'});
}

function writePackageJson(conf) {
    return writeFile("./test/publish/package.json", JSON.stringify(conf));
}

function publish() {
    return exec("../../bin/cli.js publish", {cwd: 'test/publish'});
}

function install() {
    return exec("../../bin/cli.js install", {cwd: 'test/install'});
}

function assert_exists(path) {
    assert(fs.existsSync(path), "Does not exist: " + path);
}

function assert_not_exists(path) {
    assert(!fs.existsSync(path), "Should not exist: " + path);
}