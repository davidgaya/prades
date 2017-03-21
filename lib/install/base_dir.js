'use strict';

/*
  This module looks for and creates a base dir to put prades cache.
  It uses npm config cache and adds to it @sb/prades/cache.
  It returns a promise because npm load config is async.
 */
const Path = require('path').posix;
const promisify = require('./../promisify');
const npm_load = promisify(require('npm').load);
const fs_stat = promisify(require('fs').stat);
const mkdirp = promisify(require('mkdirp'));

module.exports = function () {
    const npm_config_cache_path = () => npm_load().then(npm => npm.config.get('cache'));
    const prades_cache_path = npm_config_cache_path().then(dir => Path.join(dir, '@sb/prades/cache'));

    prades_cache_path.then(dir => {
        return fs_stat(dir).catch(reason => {
            if (reason.code === "ENOENT") {
                console.log('Creating prades cache directory.');
                return mkdirp(dir);
            } else {
                throw(reason);
            }
        });
    });

    return prades_cache_path;
};
