'use strict';
const assert = require('assert');
const sinon = require('sinon');

describe("Integrity Cache", function () {
    const integrity_cache = require('../../lib/install/integrity_cache');

    describe("initialize", function () {
        it("takes an underlying cache", function () {
            const wrapped_cache = {
                read: () => {},
                write: () => {},
                del: () => {}
            };
            integrity_cache(wrapped_cache);
        });
        it("fails if no cache is passed", function () {
            assert.throws(() => integrity_cache(), Error);
        });
    });

    describe("#write", function () {
        it("passes to the underlying cache", function (done) {
            const wrapped_cache = {
                read: () => {},
                write: sinon.spy(),
                del: () => {}
            };
            const cache = integrity_cache(wrapped_cache);
            cache.write('key', 'val');
            assert(wrapped_cache.write.called);
            done();
        });
    });

    describe("#read", function () {
        let wrapped_cache;
        let cache;
        beforeEach(function() {
            wrapped_cache = {
                read: sinon.stub(),
                write: sinon.stub(),
                del: sinon.stub()
            };
            cache = integrity_cache(wrapped_cache);
        });

        it("if there is a valid content returns it", function () {
            // the underlying cache returns a content who's key is the md5
            wrapped_cache.read.onCall(0).returns( Promise.resolve(string_to_stream('this is the test content')) );
            wrapped_cache.read.returns(Promise.resolve(string_to_stream('this is the test content')));
            return cache.read('5cba7cb809bb2fdf68582b1197e49fd2').then(value => {
                assert(value);
                assert(wrapped_cache.read.called);
                return assert_equal_promise('this is the test content', stream_to_string(value));
            });

        });
        it("if there is a corrupted content then returns undefined", function () {
            // the underlying cache returns a content who's key is not the md5
            wrapped_cache.read.onCall(0).returns( Promise.resolve(string_to_stream('this is the test content')) );
            wrapped_cache.read.onCall(1).returns( undefined );
            return cache.read('1234').then(value => {
                assert(wrapped_cache.del.called);
                return assert( ! value);
            });

        });
        it("if there is no content then returns undefined", function () {
            wrapped_cache.read.onCall(1).returns( undefined );
            return cache.read('1234').then(value => {
                assert( ! value);
                assert(wrapped_cache.read.called);
            });
        });
    });


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
    function assert_equal_promise(p1, p2) {

        return Promise.all([p1, p2]).then(ary => {
            const v1 = ary[0];
            const v2 = ary[1];
            assert.equal(v1, v2);
        });
    }
});
