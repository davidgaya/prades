'use strict';
var fs = require('fs');
var os = require('os');
var uri_template = require('url-template'); // using RFC 6570 for file name

module.exports = function (opt) {
    var log  = opt.logger.child({module: 'package_json'});
    var config = JSON.parse(fs.readFileSync('./package.json'));

    var file_uri = decodeURIComponent(uri_template.parse(config.binary.file).expand({
        package_name: config.name.replace("@", ""),
        package_version: config.version,
        node_abi: 'node_' + process.versions.modules,
        platform: os.platform(),
        arch: os.arch(),
        other: 'non-sense'
    }));
    log.info({config: {
        path: config.binary.path,
        file_name: file_uri,
        host: config.binary.host
    }}, "Using following package.json config: ");

    return {
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
};
