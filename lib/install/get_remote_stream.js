'use strict';

/*
  This module is reponsible of downloading the binary package from the given url.
  It takes the URL parameter.
  It returns a Promise of the binary remote stream.
 */
const request = require('request');
const log = require('npmlog');

const Transform = require('stream').Transform;
const clone_stream = new Transform({
    transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
    }
});

module.exports = function get_remote_stream(url) {
    log.http("GET", url);
    return new Promise(function (fulfill, reject) {
        const http_stream = request(url);
        http_stream.on('response', (res) => {
            log.http(res.statusCode);
            if (res.statusCode >= 200 && res.statusCode < 300) {
                fulfill(http_stream.pipe(clone_stream));
            } else {
                const err = Error("File does not exist. Ask developer to publish binaries for this version.");
                log.error("ERROR", err);
                reject(err);
            }
        });
        http_stream.on('error', (err) => { reject(err); });
    });
};
