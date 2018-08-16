'use strict';

const promisify = require('../promisify');
const benchmark = require('../benchmark');

const temp = require('temp').track();
const copy_dir = promisify(require('ncp').ncp);
const get_size = promisify(require('get-folder-size'));
const grunt = require('grunt');
const path = require('path');

function expand_files(directory, patterns) {
    const original_directory = process.cwd();
    process.chdir(directory);
    const file_list = grunt.file.expand({follow: true}, patterns).map((e)=>path.resolve(e));
    process.chdir(original_directory);
    file_list.push(directory);
    return file_list;
}

module.exports = (patterns, options, log) => {
    patterns.push('!package.json');
    patterns.push('!node_modules');

    const source_dir = process.cwd();
    const target_dir = temp.mkdirSync('prades_packer_');

    const list_of_files = expand_files(source_dir, patterns);
    function filter (entry) {
        if (options.verbose) {
            log.info(list_of_files.indexOf(entry) !== -1 ? 'match: ': 'ignore:', entry);
        }
        return list_of_files.indexOf(entry) !== -1;
    }
    return copy_dir(source_dir, target_dir, { dereference: true, filter })
        .then(() => benchmark()(target_dir))
        .then(msg => log.info('COPY', msg))
        .then(() => get_size(target_dir))
        .then(size => ({
            path: target_dir,
            size
        }));
};
