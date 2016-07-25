/*
 See doc/package_json.md
   prades publish should give error if you are trying to publish a binary for an ignored platform.
   prades install should do nothing (maybe only info message) if it is an ignored platform.
 */

'use strict';
require('./utils')(); /* globals std_package_json, writePackageJson, writeInstallPackageJson, publish, unpublish, npm_publish, npm_unpublish, install, clean_install_dir, assert_exists, assert_not_exists, assert_rejected */

const assert = require('assert');

describe('os and cpu options', function () {
    this.timeout(process.env.TIMEOUT || 8000);

    before(() =>
        writePackageJson(std_package_json()).then(npm_unpublish)
    );

    after( clean_install_dir );

    // publish should give error if you are trying to publish a binary for an ignored platform.
    describe('publish', function () {
        it('works if there is no os or cpu', () =>
            writePackageJson(std_package_json()).then(publish)
        );
        it('works if the os and cpu are enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = [process.platform];
            packageJson.binary.cpu = [process.arch];
            return writePackageJson(packageJson).then(publish);
        });
        it('gives an error if the os is NOT enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = ["martian"];
            packageJson.binary.cpu = [process.arch];
            return assert_rejected( writePackageJson(packageJson).then(publish) );
        });
        it('gives an error if the cpu is NOT enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = [process.platform];
            packageJson.binary.cpu = ["martian"];
            return assert_rejected( writePackageJson(packageJson).then(publish) );
        });
    });

    // install should do nothing (maybe only info message) if it is an ignored platform.
    describe("install", function () {

        beforeEach( clean_install_dir );

        before(() =>
            writePackageJson(std_package_json()).then(publish)
        );

        it('installs if there is no os or cpu', () =>
            writeInstallPackageJson(std_package_json()).then(install)
                .then(() => assert_exists("./test/install/boost"))
        );
        it('installs if the os and cpu are enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = [process.platform];
            packageJson.binary.cpu = [process.arch];
            return writeInstallPackageJson(packageJson).then(install)
                .then(() => assert_exists("./test/install/boost"));
        });
        it('skips install if the os in NOT enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = ["martian"];
            packageJson.binary.cpu = [process.arch];
            return writeInstallPackageJson(packageJson).then(install)
                .then(() => assert_not_exists("./test/install/boost"));
        });
        it('skips install if the cpu in NOT enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = [process.platform];
            packageJson.binary.cpu = ["martian"];
            return writeInstallPackageJson(packageJson).then(install)
                .then(() => assert_not_exists("./test/install/boost"));
        });
    });
});
