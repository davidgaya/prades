#!/usr/bin/env node
'use strict';

var promisify = require('./lib/promisify');
var request = require('request');
var fs = require('fs');
var log = require('npmlog');
var temp = require('temp').track(); // Automatically track and cleanup files at exit
var pack = require('tar-pack').pack;

log.info("running prades publish!");
var get_redirect_location = require('./lib/get_location')(log);
var package_json = require('./lib/package')({logger: log});
var npm_credentials = require('./lib/npm_credentials');

package_json.then(function (config) {
    Promise.all([
        get_signed_target_url(config),
        get_packed_file_path(config.path())
    ]).then(function (ary) {
        // This is the ugly part of Promise.all, we get an array of fulfilled values
        var url = ary[0];
        var file_path = ary[1];
        put(url, file_path);
    });
}).catch((reason) => {log.error(reason);});

// takes host and path
// returns a Promise of the signed url
function get_signed_target_url(config) {
    var credentials = npm_credentials({
        host: config.host(),
        logger: log
    });
    var host = config.host();
    var file_name = config.file_name();

    function request_put_to_registry(token) {
        log.http('PUT', host + file_name);
        return promisify(request)({
            baseUrl: host,
            uri: file_name,
            method: 'PUT',
            followRedirect: false,
            auth: {
                bearer: token
            }
        });
    }

    return credentials.then(request_put_to_registry).then(get_redirect_location);
}

// takes a path to pack
// returns a Promise of the packed file
function get_packed_file_path(paths_to_pack) {
    if (paths_to_pack.constructor !== Array) {
        paths_to_pack = [paths_to_pack];
    }
    var temp_file = temp.createWriteStream();
    var first = true;
    var filter = function (entry) {
        if (first) {
            first = false;
            return true;
        }
        var it_matches = paths_to_pack.reduce((y, expr) => y || RegExp(expr).test(entry.path), false);
        return it_matches;
    };
    return new Promise(function (fulfill, reject) {
        pack('.', {filter: filter, ignoreFiles: 'no_ignore_file'})
            .pipe(temp_file)
            .on('error', function (err) {
                log.error(err.stack);
                reject(err);
            })
            .on('close', function () {
                log.info('PACK', 'done ('+ temp_file.path + ')');
                fulfill(temp_file.path);
            });
    });
}

function put(url, file_path) {
    log.http("PUT", url);
    var headers = {
        'content-type': 'application/octet-stream',
        'content-length': fs.statSync(file_path).size
    };
    var req = request.put({uri: url, headers: headers});
    req.on('response', function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            log.http(res.statusCode, 'Uploaded successfully.');
        } else {
            log.http(res.statusCode, res.body);
            throw("error uploading file");
        }
    });
    req.on('error', (err) => {throw(err);});
    fs.createReadStream(file_path).pipe(req);
}
