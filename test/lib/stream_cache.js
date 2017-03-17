'use strict';
const assert = require('assert');
const temp = require('temp');

describe('stream cache', function () {
    const stream_cache = require('../../lib/stream_cache')('tmp');

    it("stores values", function () {
        const key = random_key();
        const text = "some value that in fact should be a stream";
        const value = string_to_stream(text);
        return stream_cache.write(key, value).then(() => {
            return stream_cache.read(key).then(stream => stream_to_string(stream)).then((val) => {
                assert.equal(text, val);
            });
        });

    });

    it("returns the written value", function () {
        const key = random_key();
        const text = "some other value";
        const value = string_to_stream(text);
        return stream_cache
            .write(key, value)
            .then(stream_to_string)
            .then((val) => {
                assert.equal(text, val);
            });
    });

    function random_key() {
        const key = parseInt(Math.random()*100000000, 10).toString();
        return Promise.resolve(key);
    }

    function string_to_stream(string) {
        const Readable = require('stream').Readable;
        const s = new Readable();
        s._read = () => {};
        s.push(string);
        s.push(null);
        return Promise.resolve(s);
    }

    function stream_to_string(stream) {
        return new Promise((resolve, reject) => {
            let string = '';
            stream.on('data', data => {
                string += data.toString();
            });
            stream.on('end', () => resolve(string));
            stream.on('error', reject);
        });
    }
});
