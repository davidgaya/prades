'use strict';

require('./utils')(); /* globals std_package_json, writePackageJson, writeInstallPackageJson, publish, unpublish, npm_publish, npm_unpublish, install, clean_install_dir, assert_exists, assert_not_exists */
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
    this.timeout(process.env.TIMEOUT || 8000);

    before(() =>
        writePackageJson(std_package_json()).then(npm_unpublish)
    );

    before(() =>
        writeInstallPackageJson(std_package_json())
    );

    beforeEach( clean_install_dir );

    it("first example", function () {
        var packageJson = std_package_json();
        packageJson.binary.path = [
            "boost/**",
            "extra_readme.md",
            "!boost/dont_pack.this"
        ];
        return writePackageJson(packageJson)
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
        });
    });

    it("second example", function () {
        var packageJson = std_package_json();
        packageJson.binary.path = [
            "boost",
            "boost/linked_file.txt",
            "boost/linked_dir/**",
            "extra_readme.md",
            "boost/boost/**",
            "boost/stage/**"
        ];
        return writePackageJson(packageJson)
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
        });
    });

    it("third example", function () {
        var packageJson = std_package_json();
        packageJson.binary.path = [
            "boost",
            "boost/boost/**",
            "boost/stage/**"
        ];
        return writePackageJson(packageJson)
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
        });
    });

    it("fourth example", function () {
        var packageJson = std_package_json();
        packageJson.binary.path = [
            "boost/**"
        ];
        return writePackageJson(packageJson)
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
        });
    });

    it("fifth example, no binary section in package.json", function (done) {
        var packageJson = std_package_json();
        delete packageJson.binary;
        writePackageJson(packageJson)
        .then(publish)
        .then(function resolve() {
            done("Should have failed and it didn't.");
        }, function reject(reason) {
            assert.ok(
                /binary section is missing/.test(reason.message),
                "Should give a clear message that binary section is missing"
            );
            done();
        }).catch(console.log);
    });

    it("unpublish example", () =>
        writePackageJson(std_package_json()).then(unpublish)
    );

});
