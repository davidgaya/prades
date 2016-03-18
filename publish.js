#!/usr/bin/env node
'use strict';

var promisify = require('./lib/promisify');
var request = require('request');
var fs = require('fs');
var path = require('path').posix;
var log = require('npmlog');
var get_location = require('./lib/get_location')(log);

log.info("running prades publish!");
var package_json = require('./lib/package')({logger: log});

var npm_credentials = require('./lib/npm_credentials');
var credentials = npm_credentials({
    host: package_json.host(),
    logger: log
});

var upload_file = function (url) {
    log.info("PUT", url);
    var file_path = path.join(package_json.path(), path.basename(package_json.file_name()));
    var headers = {
        'content-type': 'application/octet-stream',
        'content-length': fs.statSync(file_path).size
    };
    var r = request.put({uri: url, headers: headers}).on('response', function (res) {
        if (res.statusCode.toString().slice(0,1) === '2') {
            log.http(res.statusCode, 'Uploaded successfully.');
        } else {
            log.http(res.statusCode, res.body);
            throw("error uploading file");
        }
    });
    fs.createReadStream(file_path).pipe(r);
};

credentials.then(function (token) {
    log.info("Uploading", package_json.file_name());
    return promisify(request)({
        baseUrl: package_json.host(),
        uri: package_json.file_name(),
        method: 'PUT',
        followRedirect: false,
        auth: {
            bearer: token
        }
    })
        .then(get_location)
        .then(upload_file);

}).catch(function (reason) {
    log.error(reason);
});
