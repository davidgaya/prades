'use strict';
var promisify = require('./promisify');
var readJson = promisify(require('read-package-json'));
var os = require('os');
var uri_template = require('url-template'); // using RFC 6570 for file name
var assert = require('assert');

const expansor = variables => template => uri_template.parse(template).expand(variables);

module.exports = function (options, log) {

    // returns a Promise
    return readJson('./package.json', log.error, false).then(function (config) {
        assert(config.binary, "Error: binary section is missing in package.json");
        var package_name = config.name.replace("@", "");

        const expand = expansor({
            package_name: package_name,
            package_version: config.version,
            node_abi: 'node_' + process.versions.modules,
            platform: options.platform || os.platform(),
            arch: options.arch || os.arch(),
            uid: options.uid || process.env.uid,
            other: 'non-sense'
        });

        const file_name = decodeURIComponent(expand(config.binary.file));

        let paths_to_pack = config.binary.path;
        if (paths_to_pack.constructor !== Array) {
            paths_to_pack = [paths_to_pack];
        }
        paths_to_pack = paths_to_pack.map(path => expand(path));

        log.info("Using following package.json config: ", JSON.stringify({
            path: paths_to_pack,
            file_name: file_name,
            host: config.binary.host,
            os: config.binary.os,
            cpu: config.binary.cpu
        }));

        return {
            path: () => paths_to_pack,
            file_name: () => file_name,
            host: () => config.binary.host,
            version: () => config.version,
            package_name: () => package_name,
            os: () => config.binary.os,
            cpu: () => config.binary.cpu
        };
    });
};
