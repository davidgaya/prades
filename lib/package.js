'use strict';
var fs = require('fs');
var os = require('os');
var uri_template = require('url-template'); // using RFC 6570 for file name

var config = JSON.parse(fs.readFileSync('./package.json'));

var file_uri = decodeURIComponent(uri_template.parse(config.binary.file).expand({
    package_name: config.name.replace("@", ""),
    package_version: config.version,
    node_abi: 'node_' + process.versions.modules,
    platform: os.platform(),
    arch: os.arch(),
    other: 'non-sense'
}));


module.exports = {
    path: function () {
        return config.binary.path;
    },
    file_name: function () {
        return file_uri;
    },
    host: function () {
        return config.binary.host;
    }
};
