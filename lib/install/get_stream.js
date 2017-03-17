'use strict';

// takes a url
// returns a Promise of the packed stream
const get_remote_stream = require('./get_remote_stream');
const get_etag = require('./get_etag');
const base_dir = require('../base_dir')();

//ToDo - replace tmp by something related to OS, ex. ~/.node/cache
const cache = require('../stream_cache')(base_dir);

function get_stream(url) {
    const key = get_etag(url); // key is a promise
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
