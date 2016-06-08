'use strict';
var promisify = require('./promisify');
var request = require('request');

module.exports = function (method, log) {
    return function get_signed_target_url(config) {
        var npm_credentials = require('./npm_credentials');
        var get_redirect_location = require('./get_location')(log);
        var credentials = npm_credentials({
            host: config.host(),
            logger: log
        });
        var host = config.host();
        var file_name = config.file_name();

        function request_to_registry(token) {
            log.http(method, host + file_name);
            return promisify(request)({
                baseUrl: host,
                uri: file_name,
                method: method,
                followRedirect: false,
                auth: {
                    bearer: token
                }
            });
        }

        return credentials.then(request_to_registry).then(get_redirect_location);
    };
};
