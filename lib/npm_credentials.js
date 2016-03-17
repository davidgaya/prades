'use strict';
var url = require('url');
var npm = require('npm');

module.exports = function (options) {
    var host = options.host;
    var log  = options.logger.child({module: 'npm_credentials'});
    //convert any base_url to //host format
    host = '//' + url.parse(host).host;
    log.info("searching credentials for " + host);
    return new Promise(function (resolve, reject) {
        npm.load(function (err, obj) {
            if (err) {reject(err);}
            var token = obj.config.getCredentialsByURI(host).token;
            log.info({credentials: {host: host, token: token}}, "Found credentials");
            resolve(token);
        });
    });
};

