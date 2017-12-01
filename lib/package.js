'use strict';
var promisify = require('./promisify');
var readJson = promisify(require('read-package-json'));
var os = require('os');
var uri_template = require('url-template'); // using RFC 6570 for file name
var assert = require('assert');

module.exports = function (options, log) {

    // returns a Promise
    return readJson('./package.json', log.error, false).then(function (config) {
        assert(config.binary, "Error: binary section is missing in package.json");
        var package_name = config.name.replace("@", "");
        var file_name = decodeURIComponent(uri_template.parse(config.binary.file).expand({
            package_name: package_name,
            package_version: config.version,
            node_abi: 'node_' + process.versions.modules,
            platform: options.platform || os.platform(),
            arch: options.arch || os.arch(),
            uid: options.uid || process.env.uid,
            other: 'non-sense'
        }));
        log.info("Using following package.json config: ", JSON.stringify({
            path: config.binary.path,
            file_name: file_name,
            host: config.binary.host,
            os: config.binary.os,
            cpu: config.binary.cpu
        }));

        return {
            path: function () {
                var paths_to_pack = config.binary.path;
                if (paths_to_pack.constructor !== Array) {
                    paths_to_pack = [paths_to_pack];
                }
                return paths_to_pack;
            },
            file_name: () => file_name,
            host: () => config.binary.host,
            version: () => config.version,
            package_name: () => package_name,
            os: () => config.binary.os,
            cpu: () => config.binary.cpu
        };
    });
};
