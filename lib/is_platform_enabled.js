'use strict';

/*
  This is a Promise middleware function. It takes a package.json config
  and returns the same config.
  In the middle it fails (throws error) if the platform is  not enabled,
  (os and cpu must match).
 */
module.exports = function is_platform_enabled(config) {
    const includes = function (ary, elem) {
        return ary.indexOf(elem) > -1;
    };

    const os_enabled = function () {
        return !config.os() || includes(config.os(), process.platform);
    };
    const cpu_enabled = function () {
        return !config.cpu() || includes(config.cpu(), process.arch);
    };

    if (!os_enabled()) {
        throw "os " + process.platform + " disabled by package.json";
    }
    if (!cpu_enabled()) {
        throw "cpu " + process.arch + " disabled by package.json";
    }
    return config;
};
