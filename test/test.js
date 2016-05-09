'use strict';

var exec = require('child_process').exec;
var assert = require('assert');
var fs = require('fs');

exec("cd test/publish; prades publish -v", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('publish error: ' + error);
    } else {
        exec("cd test/install; rm -R boost/ extra_readme.md; prades install", function puts(error, stdout, stderr) {
            if (error !== null) {
                console.log('install error: ' + error);
            } else {
                assert_result();
            }
        });
    }
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
    console.log('ok');
}

function assert_exists(path) {
    assert(fs.existsSync(path), "Does not exist: " + path);
}

function assert_not_exists(path) {
    assert(!fs.existsSync(path), "Does not exist: " + path);
}
