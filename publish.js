#!/usr/bin/env node
'use strict';

var promisify = require('./lib/promisify');
var request = require('request');
var fs = require('fs');
var path = require('path').posix;
var log = require('npmlog');

log.info("running prades publish!");
var package_json = require('./lib/package')({logger: log});

var npm_credentials = require('./lib/npm_credentials');
var credentials = npm_credentials({
    host: package_json.host(),
    logger: log
});

var get_location = function (res)  {
    if(res.statusCode.toString().slice(0,1) === '3') {
        log.info("redirected ", res.headers.location);
        return res.headers.location;
    } else {
        throw(res.body);
    }
};

var upload_file = function (url) {
    log.info("Uploading to ", url);
    var file_path = path.join(package_json.path(), path.basename(package_json.file_name()));
    var headers = {
        'content-type': 'application/octet-stream',
        'content-length': fs.statSync(file_path).size
    };
    var r = request.put({uri: url, headers: headers}).on('response', function (res) {
        if (res.statusCode.toString().slice(0,1) === '2') {
            log.info('Uploaded successfully.');
        } else {
            throw("error uploading file");
        }
    });
    fs.createReadStream(file_path).pipe(r);
};

credentials.then(function (token) {
    log.info("Uploading: ", package_json.file_name());
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
