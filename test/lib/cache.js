'use strict';
const assert = require('assert');
const temp = require('temp').track();
const cache_dir = temp.mkdirSync('prades_cache_test_');

describe('cache', function () {
    const cache = require('../../lib/cache')(cache_dir);

    it("example", function () {
        const key = random_key();

        return cache.read(key).then((exists) => {
            if (! exists) {
                return cache.write(key, "some value");
            } else {
                return cache.read(key);
            }
        });
    });

    it("stores values", function () {
        const key = random_key();
        const value = "some value that in fact should be a stream";
        return cache.write(key, value).then(() => {
            return cache.read(key).then((val) => {
                assert.equal(value, val);
            });
        });

    });

    it("returns the written value", function () {
        const key = random_key();
        const value = "some other value";
        return cache.write(key, value).then((val) => {
            assert.equal(value, val);
        });
    });
    function random_key() {
        const key = parseInt(Math.random()*100000000, 10);
        return Promise.resolve(key);
    }
});
