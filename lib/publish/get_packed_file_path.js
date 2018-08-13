'use strict';

const copy_dir = require('./copy_dir');
const promisify = require('../promisify');
const benchmark = require('../benchmark');

var temp = require('temp');
const piped_pack = require('tar-pack').pack;
const grunt = require('grunt');
const _path = require('path');

const expand_files = (directory, patterns) => {
    const original_directory = process.cwd();
    process.chdir(directory);
    const file_list = grunt.file.expand({follow: true}, patterns).map((e) => _path.resolve(e));
    process.chdir(original_directory);
    file_list.push(directory);
    return file_list;
};

/*
  Converts pipe function to a promise function
  that promises a target file with the pack
 */
const pack = (source_dir, options) => new Promise(function (fulfill, reject) {
    const target_file = temp.createWriteStream();
    piped_pack(source_dir, options)
        .pipe(target_file)
        .on('error', function (err) {
            reject(err);
        })
        .on('close', function () {
            fulfill(target_file.path);
        });
});

module.exports = (patterns, options, log) => copy_dir(patterns, options, log)
    .then(({ path }) => pack(path, {ignoreFiles: 'no_ignore_file'}))
    .then(target_path => {
        log.info('PACK', benchmark()(target_path));
        return target_path;
    });
