'use strict';
var url = require('url');
var npm = require('npm');

module.exports = function (host) {
    //convert any base_url to //host format
    host = '//' + url.parse(host).host;

    return new Promise(function (resolve, reject) {
        npm.load(function (err, obj) {
            if (err) {reject(err);}
            resolve( obj.config.getCredentialsByURI(host).token);
        });
    });
};

