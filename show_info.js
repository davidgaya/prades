#!/usr/bin/env node
'use strict';

var promisify = require('./lib/promisify');
var request = promisify(require('request'));
var log = require('npmlog');
var url_signer = require('./lib/url_signer');
var package_json = require('./lib/package')(log);
var get_signed_source_url = url_signer('GET', log);
var xml_parse = promisify(require('xml2js').parseString);

log.info("running prades show_info!");

var options;

var npm = require('npm');
var load = promisify(npm.load);
var view = promisify(npm.view);

// takes a url
// returns a Promise of the body
function get_xml_body(url) {
    return request(url)
        .then((req) => {
            if (req.statusCode !== 200) {throw(new Error("S3 error. " + req.body));}
            return req.body;
        });
}

function get_binary_list() {
    return package_json.then(function (config) {
        config.file_name = () => '/';
        return get_signed_source_url(config)
            .then((url) => url + "&prefix=" + config.package_name() + "/"+ config.version() + "&list-type=2")
            .then(get_xml_body)
            .then((xml_body) => xml_parse(xml_body))
            .then((js_body) => js_body.ListBucketResult.Contents)
            .then((contents) =>
                contents.map(function (el) {
                    return {
                        file: el.Key[0],
                        last_modified: el.LastModified[0],
                        size: parseInt(el.Size[0], 10),
                        md5: el.ETag[0].replace(/^\"(.*)\"$/, "$1")
                    };
                })
            )
            .then(console.log);
    }).catch((reason) => {
        log.error(reason);
        throw(Error(reason));
    });
}

module.exports = function (opt) {
    options = opt;

    return load()
        .then(()=>view())
        .catch((reason) => {
            log.error("This package is not published.");
            console.log('This package is not published.');
        })
        .then(get_binary_list);

};
