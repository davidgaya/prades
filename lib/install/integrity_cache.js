'use strict';
/*
  This is a cache wrapper that checks the integrity of the inner value.
  The integrity can be verified because the key used happens to be the MD5 digest
  of the content.
 */

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

// key: promise of key
// readable: promise of stream OR promise of undefined
const verify_integrity = (key_promise, readable_promise) => {
    const md5sum = require('crypto').createHash('md5');
    return Promise.all([key_promise, readable_promise]).then((ary) => {
        const key = ary[0];
        const readable = ary[1];

        const hash_promise = stream_to_string(readable.pipe(md5sum));
        return hash_promise.then(hash => {
            if (key !== hash) {
                throw(new Error("Corrupted! Hashes don't match: "));
            }
        });
    });

};

module.exports = function (base_cache) {
    const write = (key, val) => base_cache.write(key, val);
    const read = (key) => {
        const readable = base_cache.read(key);
        return verify_integrity(key, readable)
            .catch(() => base_cache.del(key))
            .then(() => base_cache.read(key));
    };

    return {
        write: write,
        read: read
    };
};
