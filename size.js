#!/usr/bin/env node
'use strict';

const log = require('npmlog');

const is_npm_frozen = require('./lib/is_npm_frozen');
const is_platform_enabled = require('./lib/is_platform_enabled');

const package_json = require('./lib/package');

log.info("running prades size!");

// takes an array of paths to pack
// returns package size
const get_package_size = require('./lib/publish/copy_dir');

const validate_npm = config => is_npm_frozen()
    .then(is_platform_enabled)
    .then(() => config);

module.exports = options => package_json(options, log)
    .then(config => options.force ? Promise.resolve(config) : validate_npm(config))
    .then(config => get_package_size(config.path(), options, log))
    .then(({ size }) => size)
    .catch(reason => {
        log.error(reason);
        throw(reason);
    });
