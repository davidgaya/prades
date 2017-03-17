'use strict';
const request = require('request');
const log = require('npmlog');

module.exports = function get_remote_stream(url) {
    return new Promise(function (fulfill, reject) {
        log.http("GET", url);
        const packed_stream = request(url);
        packed_stream.on('response', (res) => {
            log.http(res.statusCode);
            if (res.statusCode >= 200 && res.statusCode < 300) {
                fulfill(packed_stream);
            } else {
                const err = Error("File does not exist. Ask developer to publish binaries for this version.");
                log.error("ERROR", err);
                reject(err);
            }
        });
        packed_stream.on('error', (err) => { reject(err); });
    });
};
