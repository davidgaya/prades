#!/usr/bin/env node
'use strict';

var request = require('request');
var fs = require('fs');
var log = require('npmlog');

const url_signer = require('./lib/url_signer');
const fail_if_npm_frozen = require('./lib/fail_if_npm_frozen');
const is_platform_enabled = require('./lib/is_platform_enabled');
log.info("running prades publish!");

var package_json = require('./lib/package')(log);

// takes host and path
// returns a Promise of the signed url
var get_signed_target_url = url_signer('PUT', log);

// takes an array of paths to pack
// returns a Promise of the packed file
var get_packed_file_path = require('./lib/publish/get_packed_file_path');

function put(url, file_path) {
    return new Promise(function (fulfill, reject) {
        var time1 = new Date();
        log.http("PUT", url);
        var headers = {
            'content-type': 'application/octet-stream',
            'content-length': fs.statSync(file_path).size
        };
        var req = request.put({uri: url, headers: headers});
        req.on('response', function (res) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                var time2 = new Date();
                log.http(res.statusCode, 'Uploaded successfully. took ' + ((time2 - time1)/1000) + "seconds");
                fulfill();
            } else {
                log.http(res.statusCode, res.body);
                reject("error uploading file");
            }
        });
        req.on('error', (err) => {reject(err);});
        fs.createReadStream(file_path).pipe(req);
    });
}

module.exports = function (options) {
    var p = package_json;
    if (!options.force) {
        p = p.then(fail_if_npm_frozen).then(is_platform_enabled);
    }
    return p.then(function (config) {
        return Promise.all([
            get_signed_target_url(config),
            get_packed_file_path(config.path(), options, log)
        ]).then(function (ary) {
            // This is the ugly part of Promise.all, we get an array of fulfilled values
            var url = ary[0];
            var file_path = ary[1];
            return put(url, file_path);
        });
    })
    .catch((reason) => {
        log.error(reason);
        var error = reason instanceof Error ? reason : new Error(reason);
        throw(error);
    });
};
