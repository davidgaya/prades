/* jshint strict: false */

var promisify = require('../lib/promisify');
var exec = promisify(require('child_process').exec);
var fs = require('fs');
var writeFile = promisify(fs.writeFile);
var assert = require('assert');

module.exports = function () {

    this.std_package_json = () => ({
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
    });

    this.writePublishPackageJson = function writePublishPackageJson(conf) {
        return writeFile("./test/publish/package.json", JSON.stringify(conf));
    };

    this.writeInstallPackageJson = function writeInstallPackageJson(conf) {
        return writeFile("./test/install/package.json", JSON.stringify(conf));
    };

    this.publish = function publish(opt) {
        opt = opt || '';
        return exec("node ../../bin/cli.js publish " + opt, {cwd: 'test/publish'}).then(() => {});
    };

    this.unpublish = function unpublish(opt) {
        opt = opt || '';
        return exec("node ../../bin/cli.js unpublish " + opt, {cwd: 'test/publish'}).then(() => {});
    };

    this.npm_publish = function npm_publish() {
        return exec("npm publish", {cwd: 'test/publish'}).then(() => {});
    };

    this.npm_unpublish = function npm_unpublish() {
        return exec("npm unpublish -f", {cwd: 'test/publish'}).then(() => {});
    };

    this.install = function install() {
        return exec("node ../../bin/cli.js install", {cwd: 'test/install'});
    };

    this.clean_install_dir = function clean_install_dir() {
        var rimraf = promisify(require('rimraf'));
        return rimraf("test/install/boost").then(function () {
            return rimraf("test/install/extra_readme.md");
        });
    };

    this.assert_exists = function assert_exists(path) {
        assert(fs.existsSync(path), "Does not exist: " + path);
    };

    this.assert_not_exists = function assert_not_exists(path) {
        assert(!fs.existsSync(path), "Should not exist: " + path);
    };

    this.show_info = function show_info(opt) {
        opt = opt || '';
        return exec("node ../../bin/cli.js info " + opt, {cwd: 'test/publish'});
    };

    this.assert_rejected = ((promise) =>
        promise.then(
            (val) => {throw new Error(val + " should have failed and it didn't");},
            (reason) => "success because failed!"
        )
    );
};
