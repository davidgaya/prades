#!/usr/bin/env node
'use strict';

var promisify = require('./lib/promisify');
var request = require('request');
var log = require('npmlog');
var url_signer = require('./lib/url_signer');
var package_json = require('./lib/package')({logger: log});
var get_signed_source_url = url_signer('GET', log);
var xml_parse = promisify(require('xml2js').parseString);

log.info("running prades show_info!");

var options;

var npm = require('npm');
var load = promisify(npm.load);
var view = promisify(npm.view);

// takes a url
// returns a Promise of the packed stream
function get_stream(url) {
    return new Promise(function (fulfill, reject) {
        log.http("GET", url);
        var r = request(url);
        var string = '';
        r.on('data',function(part){
            string += part;
        });
        r.on('end',function(){
            fulfill(string);
        });
        r.on('response', (res) => {
            log.http(res.statusCode);
            if (res.statusCode < 200 && res.statusCode >= 300) {
                var err = Error("Nothing to see here.");
                log.error("ERROR", err);
                reject(err);
            }
        });
        r.on('error', (err) => { reject(err); });
    });
}

function get_binary_list() {
    return package_json.then(function (config) {
        config.file_name = () => '/';
        return get_signed_source_url(config)
            .then((url) => url + "&prefix=" + config.package_name() + "/"+ config.version() + "&list-type=2")
            .then(get_stream).then(function (xml_body) {
                xml_parse(xml_body).then(function (js_body) {
                    console.log(js_body.ListBucketResult.Contents.map(function (el) {
                        return {
                            file: el.Key[0],
                            last_modified: el.LastModified[0],
                            size: parseInt(el.Size[0], 10),
                            md5: el.ETag[0].replace(/^\"(.*)\"$/, "$1")
                        };
                    }));
                });
                //console.log(xml_body);
            });
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
            log.error("not published");
            console.log('This package is not published.');
        })
        .then(get_binary_list);

};
