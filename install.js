#!/usr/bin/env node
'use strict';

var promisify = require('./lib/promisify');
var request = require('request');
var log = require('npmlog');
var unpack = require('tar-pack').unpack;
var url_signer = require('./lib/url_signer');

log.info("running prades install!");

var package_json = require('./lib/package')({logger: log});
var options;

// takes host and path
// returns a Promise of the signed url
var get_signed_source_url = url_signer('GET', log);

// takes a url
// returns a Promise of the packed stream
function get_stream(url) {
    return new Promise(function (fulfill, reject) {
        log.http("GET", url);
        var r = request(url);
        r.on('response', (res) => {
            log.http(res.statusCode);
            if (res.statusCode >= 200 && res.statusCode < 300) {
                fulfill(r);
            } else {
                var err = Error("File does not exist. Ask developer to publish binaries for this version.");
                log.error("ERROR", err);
                reject(err);
            }
        });
        r.on('error', (err) => { reject(err); });
    });
}

function extract_stream(packed_stream) {
    packed_stream
        .pipe(unpack('.', {keepFiles: true}, function (err) {
            if (err) {
                log.error(err);
            } else {
                log.info('UNPACK', 'done');
            }
        })).on('error', (err) => {log.error(err);});
}

module.exports = function (opt) {
    options = opt;

    return package_json.then(function (config) {
        return get_signed_source_url(config)
            .then(get_stream)
            .then(extract_stream);
    }).catch((reason) => {
        log.error(reason);
        throw(Error(reason));
    });

};
