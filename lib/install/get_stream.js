'use strict';

/*
  This module get the steam of the binary package. It either returns
  the local cached file stream or it first downloads it.
  Takes a URL as parameter.
  Returns a Promise of the binary stream
 */
const get_remote_stream = require('./get_remote_stream');
const get_etag = require('./get_etag');
const base_dir = require('./base_dir')();

const stream_cache = require('./stream_cache')(base_dir);
const cache = require('./integrity_cache')(stream_cache);

function get_stream(url) {
    const key = get_etag(url);
    return cache.read(key).then(local_stream => {
        if (local_stream) {
            return local_stream;
        } else {
            //write returns a stream promise
            return cache.write(key, get_remote_stream(url));
        }
    });
}

module.exports = get_stream;
