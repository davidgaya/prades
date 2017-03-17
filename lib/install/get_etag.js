'use strict';
const request = require('request');
const log = require('npmlog');

module.exports = function get_etag(url) {
    return new Promise(function (fulfill, reject) {
        log.http("HEAD", url);
        const req = request(url);
        req.on('response', (res) => {
            log.http(res.statusCode);
            if (res.statusCode >= 200 && res.statusCode < 300) {
                let etag = res.headers.etag;
                req.abort();
                fulfill(etag);
            } else {
                const err = Error("File does not exist. Ask developer to publish binaries for this version.");
                log.error("ERROR", err);
                reject(err);
            }
        });
        req.on('error', reject);
    });
};
