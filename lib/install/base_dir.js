'use strict';
const Path = require('path').posix;
const npm = require('npm');
const promisify = require('./../promisify');
const fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = function () {
    const npm_config_cache_path = () => promisify(npm.load)().then(npm => npm.config.get('cache'));
    const prades_cache_path = npm_config_cache_path().then(dir => Path.join(dir, '@sb/prades/cache'));

    prades_cache_path.then(dir => {
        try {
            fs.statSync(dir);
        } catch (e) {
            if (e.code === "ENOENT") {
                console.log('Creating prades cache directory.');
                mkdirp(dir, function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            } else {
                throw(e);
            }
        }
    });

    return prades_cache_path;
};
