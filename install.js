#!/usr/bin/env node
'use strict';

var promisify = require('./lib/promisify');
var request = require('request');
var log = require('npmlog');
var unpack = require('tar-pack').unpack;

log.info("running prades install!");
var get_redirect_location = require('./lib/get_location')(log);
var package_json = require('./lib/package')({logger: log});
var npm_credentials = require('./lib/npm_credentials');

package_json.then(function (config) {
    return get_signed_source_url(config)
        .then(get_stream)
        .then(extract_stream);
}).catch(log.error);

// takes host and path
// returns a Promise of the signed url
function get_signed_source_url(config) {
    var credentials = npm_credentials({
        host: config.host(),
        logger: log
    });
    var host = config.host();
    var file_name = config.file_name();

    function request_get_to_registry(token) {
        log.http('GET', host + file_name);
        return promisify(request)({
            baseUrl: host,
            uri: file_name,
            followRedirect: false,
            auth: {
                bearer: token
            }
        });
    }

    return credentials.then(request_get_to_registry).then(get_redirect_location);
}

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
