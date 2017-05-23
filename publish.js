#!/usr/bin/env node
'use strict';

var request = require('request');
var fs = require('fs');
var log = require('npmlog');

const url_signer = require('./lib/url_signer');
const is_npm_frozen = require('./lib/is_npm_frozen');
const is_platform_enabled = require('./lib/is_platform_enabled');
const benchmark = require('./lib/benchmark');
log.info("running prades publish!");

var package_json = require('./lib/package');

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
    var p = package_json(options, log);
    if (!options.force) {
        p = p.then(is_npm_frozen).then(is_platform_enabled);
    }
    return p.then( (config) =>
        Promise.all([
            get_signed_target_url(config),
            get_packed_file_path(config.path(), options, log)
        ]).then((results) => put(results[0], results[1]))
    )
    .catch((reason) => {
        log.error(reason);
        throw(reason);
    });
};
