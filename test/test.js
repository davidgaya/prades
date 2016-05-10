'use strict';

// f => g
var promisify = require('../lib/promisify');
var exec = promisify(require('child_process').exec);
var assert = require('assert');
var fs = require('fs');

describe("publish and install", function () {
    this.timeout(5000);

    before(function (done) {
        exec("rm -Rf boost/ extra_readme.md", {cwd: 'test/install'}).then(done, done);
    });

    it("first example", function (done) {
        exec("prades publish -v", {cwd: 'test/publish'}).then(function () {
            return exec("rm -R boost/ extra_readme.md; prades install", {cwd: 'test/install'});
        }).then(assert_result).then(done, done);

    });

    it("second example", function (done) {
        exec("prades publish -vd", {cwd: 'test/publish2'}).then(function () {
            return exec("rm -R boost/ extra_readme.md; prades install", {cwd: 'test/install'});
        }).then(assert_result).then(done, done);
    });

});

function assert_result() {
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
}

function assert_exists(path) {
    assert(fs.existsSync(path), "Does not exist: " + path);
}

function assert_not_exists(path) {
    assert(!fs.existsSync(path), "Does not exist: " + path);
}
