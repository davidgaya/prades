#!/usr/bin/env node
'use strict';

const request = require('request');
const log = require('npmlog');
const unpack = require('tar-pack').unpack;
const url_signer = require('./lib/url_signer');
const is_platform_enabled = require('./lib/is_platform_enabled');
log.info("running prades install!");

const package_json = require('./lib/package')(log);

// takes a config with host and file_name
// returns a Promise of the signed url
const get_signed_source_url = url_signer('GET', log);

// takes a url
// returns a Promise of the packed stream
function get_stream(url) {
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
}

function extract_stream(packed_stream) {
    packed_stream
        .pipe(unpack('.', {keepFiles: true}, function (err) {
            if (err) {
                throw(err);
            } else {
                log.info('UNPACK', 'done');
            }
        })).on('error', (err) => {throw(err);});
}

module.exports = function (options) {

    const download_and_extract = (config) => get_signed_source_url(config)
        .then(get_stream)
        .then(extract_stream);

    return package_json
        .then(is_platform_enabled)
        .then(download_and_extract, (reason) => log.info("Nothing to do. " + reason))
        .catch((reason) => {
            log.error(reason);
            throw(Error(reason));
        });
};
