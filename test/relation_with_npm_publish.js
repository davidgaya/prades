'use strict';

require('./utils')(); /* globals std_package_json, writePublishPackageJson, publish, unpublish, npm_publish, npm_unpublish, assert_rejected */

describe("relation with npm publish", function () {
    this.timeout(process.env.TIMEOUT || 8000);

    before(() =>
      writePublishPackageJson(std_package_json())
    );

    describe("npm package is not published", function () {

        before( npm_unpublish );

        it("can publish binaries", () =>
            publish()
        );
    });

    describe("npm package is published", function () {

        before( npm_publish );

        it("cannot publish binaries", () =>
            assert_rejected( publish() )
        );

        it("can force publish binaries", () =>
            publish('-f')
        );

        it("cannot unpublish binaries", () =>
            assert_rejected( unpublish() )
        );

        it("can force unpublish binaries", () =>
            unpublish('-f')
        );

    });

});
