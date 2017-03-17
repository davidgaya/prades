#!/usr/bin/env node
'use strict';

const log = require('npmlog');
const unpack = require('tar-pack').unpack;
const url_signer = require('./lib/url_signer');
const is_platform_enabled = require('./lib/is_platform_enabled');

// takes a config with host and file_name
// returns a Promise of the signed url
const get_signed_source_url = url_signer('GET', log);
const get_stream = require('./lib/install/get_stream');

function extract_stream(packed_stream) {
    packed_stream
        .pipe(unpack('.', {keepFiles: true}, function (err) {
            if (err) {
                throw(err);
            } else {
                log.info('UNPACK', 'done');
            }
        })).on('error', (err) => {throw(err);});
}

const there_is_a_git_folder = function () {
    const stat = require('fs').statSync;
    try {
        stat('.git');
        return true;
    } catch(e) {
        return false;
    }
};

const download_and_extract = config => {
    return get_signed_source_url(config)
        .then(get_stream)
        .then(extract_stream);
};

module.exports = function (options) {

    if (!options.force && there_is_a_git_folder()) {
        log.info('.git folder present, skipping prades install. Force with -f option.');
        return Promise.resolve('good');
    }
    log.info("running prades install!");
    const package_json = require('./lib/package')(log);
    return package_json
        .then(is_platform_enabled)
        .then(download_and_extract, reason => log.info("Nothing to do. " + reason))
        .catch((reason) => {
            log.error(reason);
            throw(Error(reason));
        });
};
