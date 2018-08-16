'use strict';

require('./utils')(); /* globals std_package_json, writePublishPackageJson, writeInstallPackageJson, publish, unpublish, install, clean_install_dir, assert_exists, assert_not_exists */
const assert = require('assert');
const isWin = /^win/.test(process.platform);
const crypto = require('crypto');

/* this are the fs fixtures
 ├── install
 │   └── package.json
 ├── linked_lib
 │   ├── linked_dir
 │   │   └── linked_file.txt
 │   └── linked_file.txt
 └── publish
    ├── boost
    │   ├── boost
    │   │   └── david_test_2.txt
    │   ├── dont_pack.this
    │   ├── linked_dir -> ../../linked_lib/linked_dir
    │  ├── linked_file.txt -> ../../linked_lib/linked_file.txt
    │   └── stage
    │       └── david_test.txt
    ├── extra_readme.md
    ├── index.js
    ├── package.json
    └── Readme.md
*/

describe("publish and install", function () {
    this.timeout(process.env.TIMEOUT || 8000);
    var packageJson = std_package_json();

    beforeEach( clean_install_dir );

    it("first example", function () {
        packageJson.version = "0.0." + crypto.randomBytes(4).readUInt32LE();
        packageJson.binary.path = [
            "boost/**",
            "extra_readme.md",
            "!boost/dont_pack.this"
        ];
        return writePublishPackageJson(packageJson)
        .then(() => writeInstallPackageJson(packageJson))
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
            if (!isWin) { //SymLink directories are not followed by git clone
                assert_exists("./test/install/boost/linked_dir/linked_file.txt");
            }
            assert_not_exists("./test/install/boost/dont_pack.this");
        })
        .then(unpublish);
    });

    it("second example", function () {
        packageJson.version = "0.0." + crypto.randomBytes(4).readUInt32LE();
        packageJson.binary.path = [
            "boost",
            "boost/linked_file.txt",
            "boost/linked_dir/**",
            "extra_readme.md",
            "boost/boost/**",
            "boost/stage/**"
        ];
        return writePublishPackageJson(packageJson)
        .then(() => writeInstallPackageJson(packageJson))
        .then(publish)
        .then(install)
        .then(function () {
            assert_exists("./test/install/package.json");
            assert_exists("./test/install/extra_readme.md");
            assert_exists("./test/install/boost");
            assert_exists("./test/install/boost/boost");
            assert_exists("./test/install/boost/stage");
            if (!isWin) { //SymLink directories are not followed by git clone
                assert_exists("./test/install/boost/linked_dir");
                assert_exists("./test/install/boost/linked_dir/linked_file.txt");
            }
            assert_exists("./test/install/boost/linked_file.txt");
            assert_exists("./test/install/boost/boost/david_test_2.txt");
            assert_exists("./test/install/boost/stage/david_test.txt");

            assert_not_exists("./test/install/boost/dont_pack.this");
        })
        .then(unpublish);
    });

    it("third example", function () {
        packageJson.version = "0.0." + crypto.randomBytes(4).readUInt32LE();
        packageJson.binary.path = [
            "boost",
            "boost/boost/**",
            "boost/stage/**"
        ];
        return writePublishPackageJson(packageJson)
        .then(() => writeInstallPackageJson(packageJson))
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
        .then(unpublish);
    });

    it("fourth example", function () {
        packageJson.version = "0.0." + crypto.randomBytes(4).readUInt32LE();
        packageJson.binary.path = [
            "boost/**"
        ];
        return writePublishPackageJson(packageJson)
        .then(() => writeInstallPackageJson(packageJson))
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
            if (!isWin) { //SymLink directories are not followed by git clone
                assert_exists("./test/install/boost/linked_dir/linked_file.txt");
            }
            assert_exists("./test/install/boost/dont_pack.this");
        })
        .then(unpublish);
    });

    it("fifth example, no binary section in package.json", function (done) {
        packageJson.version = "0.0." + crypto.randomBytes(4).readUInt32LE();
        delete packageJson.binary;
        writePublishPackageJson(packageJson)
        .then(() => writeInstallPackageJson(packageJson))
        .then(publish)
        .then(function resolve() {
            done("Should have failed and it didn't.");
        }, function reject(reason) {
            assert.ok(
                /binary section is missing/.test(reason.message),
                "Should give a clear message that binary section is missing"
            );
            done();
        }).catch(console.log)
        .then(unpublish);
    });

    it("unpublish example", () =>
        writePublishPackageJson(std_package_json()).then(unpublish)
    );

});
