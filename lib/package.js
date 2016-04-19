'use strict';
var promisify = require('./promisify');
var readJson = promisify(require('read-package-json'));
var os = require('os');
var uri_template = require('url-template'); // using RFC 6570 for file name

module.exports = function (opt) {
    var log  = opt.logger;

    // returns a Promise
    return readJson('./package.json', log.error, false).then(function (config) {
        var file_uri = decodeURIComponent(uri_template.parse(config.binary.file).expand({
            package_name: config.name.replace("@", ""),
            package_version: config.version,
            node_abi: 'node_' + process.versions.modules,
            platform: os.platform(),
            arch: os.arch(),
            other: 'non-sense'
        }));
        log.info("Using following package.json config: ", JSON.stringify({
            path: config.binary.path,
            file_name: file_uri,
            host: config.binary.host
        }));

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
    });
};
