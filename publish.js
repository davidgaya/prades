#!/usr/bin/env node
'use strict';

var request = require('request');
var fs = require('fs');
var log = require('npmlog');

const url_signer = require('./lib/url_signer');
const fail_if_npm_frozen = require('./lib/fail_if_npm_frozen');
const is_platform_enabled = require('./lib/is_platform_enabled');
const benchmark = require('./lib/benchmark');
log.info("running prades publish!");

var package_json = require('./lib/package')(log);

// takes host and path
// returns a Promise of the signed url
var get_signed_target_url = url_signer('PUT', log);

// takes an array of paths to pack
// returns a Promise of the packed file
var get_packed_file_path = require('./lib/publish/get_packed_file_path');

function put(url, file_path) {
    var promise = new Promise(function (fulfill, reject) {
        log.http("PUT", url);
        var headers = {
            'content-type': 'application/octet-stream',
            'content-length': fs.statSync(file_path).size
        };
        var req = request.put({uri: url, headers: headers});
        req.on('error', (err) => reject(err));
        req.on('response', function (res) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                fulfill("Success upload");
            } else {
                reject("Error uploading file. Status: " + res.statusCode + ". " + res.body);
            }
        });
        fs.createReadStream(file_path).pipe(req);
    });
    promise.then(benchmark()).then((msg) => log.http('200', msg));
    return promise;
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
