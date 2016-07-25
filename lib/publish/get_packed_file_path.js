'use strict';
const promisify = require('../promisify');
var temp = require('temp');
const copy_dir = promisify(require('ncp').ncp);
const piped_pack = require('tar-pack').pack;
const grunt = require('grunt');
const path = require('path');
const benchmark = require('../benchmark');

function expand_files(directory, patterns) {
    const original_directory = process.cwd();
    process.chdir(directory);
    const file_list = grunt.file.expand({follow: true}, patterns).map((e)=>path.resolve(e));
    process.chdir(original_directory);
    file_list.push(directory);
    return file_list;
}

/*
  Converts pipe function to a promise function
  that promises a target file with the pack
 */
const pack = function (source_dir, options) {
    const target_file = temp.createWriteStream();
    const promise = new Promise(function (fulfill, reject) {
        piped_pack(source_dir, options)
            .pipe(target_file)
            .on('error', function (err) {
                reject(err);
            })
            .on('close', function () {
                fulfill(target_file.path);
            });
    });
    return promise;
};

module.exports = function get_packed_file_path(patterns, options, log) {

    patterns.push('!package.json');
    patterns.push('!node_modules');

    if (!options.debug) {
        temp = temp.track(); //this removes temp files at exit
    }

    const source_dir = process.cwd();
    const target_dir = temp.mkdirSync('prades_packer_');

    const list_of_files = expand_files(source_dir, patterns);
    function filter (entry) {
        if (options.verbose) {
            log.info(list_of_files.indexOf(entry) !== -1 ? 'match: ': 'ignore:', entry);
        }
        return list_of_files.indexOf(entry) !== -1;
    }

    const copied_dir = copy_dir(source_dir, target_dir, {dereference: true, filter: filter}).then(() => target_dir);

    copied_dir.then(benchmark()).then((benchmark_msg) => log.info('COPY', benchmark_msg));

    return copied_dir.then((directory) => {

        const packed_file = pack(directory, {ignoreFiles: 'no_ignore_file'});

        packed_file.then(benchmark()).then((benchmark_msg) => log.info('PACK', benchmark_msg));

        return packed_file;
    });
};
