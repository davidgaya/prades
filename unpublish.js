#!/usr/bin/env node
'use strict';

const request = require('request');
const fs = require('fs');
const log = require('npmlog');
const url_signer = require('./lib/url_signer');
const is_npm_frozen = require('./lib/is_npm_frozen');

log.info("running prades unpublish!");

const package_json = require('./lib/package');

// takes host and path
// returns a Promise of the signed url
const get_signed_target_url = url_signer('DELETE', log);

function del(url) {
    const time1 = new Date();
    log.http("DELETE", url);
    const req = request.del({uri: url});
    req.on('response', function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const time2 = new Date();
            log.http(res.statusCode, 'Deleted successfully. took ' + ((time2 - time1)/1000) + "seconds");
        } else {
            log.http(res.statusCode, res.body);
            throw("error deleting file");
        }
    });
    req.on('error', (err) => {throw(err);});
}

module.exports = function (options) {
    options = options || {};
    var p = package_json(options, log);
    if (!options.force) {
        p = p.then(is_npm_frozen);
    }
    return p
        .then(get_signed_target_url)
        .then(del)
        .catch((reason) => {
            log.error(reason);
            throw(Error(reason));
        });
};
