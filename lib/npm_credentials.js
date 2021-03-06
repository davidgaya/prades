'use strict';
var url = require('url');
var npm = require('npm');

module.exports = function (options) {
    var host = options.host;
    var log  = options.logger;
    //convert any base_url to //host format
    host = '//' + url.parse(host).host;
    log.info("searching credentials for ", host);
    return new Promise(function (resolve, reject) {
        npm.load(function (err, obj) {
            if (err) {reject(err);}
            var token = obj.config.getCredentialsByURI(host).token;
            if (token) {
                log.info("Found npm credentials for ", host);
                resolve(token);
            } else {
                reject("npm credentials not found for " + host);
            }
        });
    });
};

