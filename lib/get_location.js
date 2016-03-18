'use strict';

module.exports = function (log) {
    return function (res)  {
        if(res.statusCode >= 300 && res.statusCode < 400) {
            log.http(res.statusCode, res.headers.location);
            return res.headers.location;
        } else {
            log.http(res.statusCode, res.body);
            throw(res.body);
        }
    };
};
