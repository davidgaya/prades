#!/usr/bin/env node
'use strict';

var promisify = require('./lib/promisify');
var request = require('request');
var fs = require('fs');
var path = require('path').posix;
var log = require('npmlog');
var get_location = require('./lib/get_location')(log);
var mkdirp = require('mkdirp');

log.info("running prades install!");
var package_json = require('./lib/package')({logger: log});

var download_file = function (url) {
    log.http("GET", url);
    mkdirp(package_json.path(), function (err) {
        if (err) {log.error('mkdirp', "Cannot create " + package_json.path());}
    });
    var file_path = path.join(package_json.path(), path.basename(package_json.file_name()));
    var file_stream = fs.createWriteStream(file_path);
    request(url)
        .on('response', (res) => {
            log.http(res.statusCode)
            if (res.statusCode.toString().slice(0,1) !== '2') {
                var err = Error("File does not exist. Ask developer to publish binaries for this version.");
                log.error("ERROR", err);
                throw err;
            }
        })
        .pipe(file_stream);
};

var npm_credentials = require('./lib/npm_credentials');
var credentials = npm_credentials({
    host: package_json.host(),
    logger: log
});
credentials.then(function (token) {
    log.info("Downloading: ", package_json.file_name());
    return promisify(request)({
        baseUrl: package_json.host(),
        uri: package_json.file_name(),
        followRedirect: false,
        auth: {
            bearer: token
        }
    })
    .then(get_location)
    .then(download_file);

}).catch(function (reason) {
    log.error(reason);
});
