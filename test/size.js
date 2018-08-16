'use strict';

require('./utils')(); /* globals std_package_json, writePublishPackageJson, writeInstallPackageJson, clean_install_dir, size */
const assert = require('assert');
const crypto = require('crypto');
const size_regex = /size=([\d]*)/;

/* this are the fs fixtures
 ├── install
 │  └── package.json
 ├── linked_lib
 │  ├── linked_dir
 │  │  └── linked_file.txt
 │  └── linked_file.txt
 └── publish
   ├── boost
   │  ├── boost
   │  │  └── david_test_2.txt
   │  ├── dont_pack.this
   │  ├── linked_dir -> ../../linked_lib/linked_dir
   │  ├── linked_file.txt -> ../../linked_lib/linked_file.txt
   │  └── stage
   │      └── david_test.txt
   ├── extra_readme.md
   ├── index.js
   ├── package.json
   └── Readme.md
*/

describe("Get package sizes", function () {
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
            .then(opt => new Promise((resolve, reject) => {
                const emitter = size(opt);
                emitter.stderr.on('data', data => {
                    const line = data.toString();
                    if (size_regex.test(line)) {
                        try {
                            assert.ok(1800 < parseInt(line.match(size_regex)[1]) < 2000);
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    }
                });
            }));
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
            .then(size)
            .then(opt => new Promise((resolve, reject) => {
                const emitter = size(opt);
                emitter.stderr.on('data', data => {
                    const line = data.toString();
                    if (size_regex.test(line)) {
                        try {
                            assert.ok(1800 < parseInt(line.match(size_regex)[1]) < 2000);
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    }
                });
            }));
    });

});
