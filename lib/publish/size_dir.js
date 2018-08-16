'use strict';

const promisify = require('../promisify');
const benchmark = require('../benchmark');
const copy_dir = require('./copy_dir');

const get_size = promisify(require('get-folder-size'));

module.exports = (patterns, options, log) => copy_dir(patterns, options, log)
    .then(target_dir => get_size(target_dir)
        .then(size => {
            const msg = benchmark()(target_dir);
            log.info('SIZE', msg);
            return size;
        }));
