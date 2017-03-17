'use strict';


// takes a url
// returns a Promise of the packed stream
const get_remote_stream = require('./get_remote_stream');
const get_etag = require('./get_etag');

//ToDo - replace tmp by something related to OS, ex. ~/.node/cache
const cache = require('./lib/stream_cache')('tmp');

function get_stream(url) {
    const key = get_etag(url); // key is a promise
    return cache.read(key).then(local_stream => {
        if (! local_stream) {
            //write returns a stream promise
            return cache.write(key, get_remote_stream(url));
        } else {
            return local_stream;
        }
    });
}

module.exports = get_stream;
