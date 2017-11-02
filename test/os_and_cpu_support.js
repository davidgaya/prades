/*
 See doc/package_json.md
   prades publish should give error if you are trying to publish a binary for an ignored platform.
   prades install should do nothing (maybe only info message) if it is an ignored platform.
 */

'use strict';
require('./utils')(); /* globals std_package_json, writePublishPackageJson, writeInstallPackageJson, publish, unpublish, npm_publish, npm_unpublish, install, clean_install_dir, assert_exists, assert_not_exists, assert_rejected */

const assert = require('assert');

describe('os and cpu options', function () {
    this.timeout(process.env.TIMEOUT || 8000);

    after( clean_install_dir );

    // publish should give error if you are trying to publish a binary for an ignored platform.
    describe('publish', function () {

        before(() =>
          writePublishPackageJson(std_package_json()).then(npm_unpublish)
        );

        it('works if there is no os or cpu', () =>
            writePublishPackageJson(std_package_json()).then(publish)
              .then(unpublish)
        );
        it('works if the os and cpu are enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = [process.platform];
            packageJson.binary.cpu = [process.arch];
            return writePublishPackageJson(packageJson).then(publish)
              .then(unpublish);
        });
        it('gives an error if the os is NOT enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = ["martian"];
            packageJson.binary.cpu = [process.arch];
            return assert_rejected( writePublishPackageJson(packageJson).then(publish) );
        });
        it('gives an error if the cpu is NOT enabled', function () {
            const packageJson = std_package_json();
            packageJson.binary.os = [process.platform];
            packageJson.binary.cpu = ["martian"];
            return assert_rejected( writePublishPackageJson(packageJson).then(publish) );
        });
    });

    // install should do nothing (maybe only info message) if it is an ignored platform.
    describe("install", function () {
        const patch_version = require('crypto').randomBytes(4).readUInt32LE();

        beforeEach( clean_install_dir );

        before(() =>
            writePublishPackageJson(std_package_json(patch_version))
              .then(npm_unpublish)
              .then(publish)
        );

        after(() => unpublish());

        it('installs if there is no os or cpu', () =>
            writeInstallPackageJson(std_package_json(patch_version)).then(install)
                .then(() => assert_exists("./test/install/boost"))
        );
        it('installs if the os and cpu are enabled', function () {
            const packageJson = std_package_json(patch_version);
            packageJson.binary.os = [process.platform];
            packageJson.binary.cpu = [process.arch];
            return writeInstallPackageJson(packageJson).then(install)
                .then(() => assert_exists("./test/install/boost"));
        });
        it('skips install if the os in NOT enabled', function () {
            const packageJson = std_package_json(patch_version);
            packageJson.binary.os = ["martian"];
            packageJson.binary.cpu = [process.arch];
            return writeInstallPackageJson(packageJson).then(install)
                .then(() => assert_not_exists("./test/install/boost"));
        });
        it('skips install if the cpu in NOT enabled', function () {
            const packageJson = std_package_json(patch_version);
            packageJson.binary.os = [process.platform];
            packageJson.binary.cpu = ["martian"];
            return writeInstallPackageJson(packageJson).then(install)
                .then(() => assert_not_exists("./test/install/boost"));
        });
    });
});
