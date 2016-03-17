#!/usr/bin/env node
'use strict';

var pack = require('./lib/package');
var promisify = require('./lib/promisify');
var request = require('request');
var fs = require('fs');
var path = require('path').posix;

console.log("running prades install!");

var get_location = function (res)  {
    if(res.statusCode === 302) {
        return res.headers.location;
    } else {
        throw(res.body);
    }
};

var download_file = function (url) {
    var file_path = path.join(pack.path(), path.basename(pack.file_name()));
    var file_stream = fs.createWriteStream(file_path);
    request(url).pipe(file_stream);
};

require('./lib/npm_credentials')(pack.host()).then(function (token) {
    console.log("Downloading: ", pack.file_name());
    promisify(request)({
        baseUrl: pack.host(),
        uri: pack.file_name(),
        followRedirect: false,
        auth: {
            bearer: token
        }
    })
    .then(get_location)
    .then(download_file)
    .catch(console.log);

});
