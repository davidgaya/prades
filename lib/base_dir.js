'use strict';
const Path = require('path').posix;
const os = require('os');

module.exports = function () {

    const npm_cache_path =/^win/.test(process.platform)?
        Path.join(process.env.APPDATA,'npm-cache'):
        Path.join(os.homedir(), '.npm');

    return Path.join(npm_cache_path, 'prades');
};
