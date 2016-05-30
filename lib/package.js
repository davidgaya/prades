'use strict';
var promisify = require('./promisify');
var readJson = promisify(require('read-package-json'));
var os = require('os');
var uri_template = require('url-template'); // using RFC 6570 for file name
var assert = require('assert');

module.exports = function (opt) {
    var log  = opt.logger;

    // returns a Promise
    return readJson('./package.json', log.error, false).then(function (config) {
        assert(config.binary, "Cannot publish, binary section is missing in package.json");
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
                var paths_to_pack = config.binary.path;
                if (paths_to_pack.constructor !== Array) {
                    paths_to_pack = [paths_to_pack];
                }
                return paths_to_pack;
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
