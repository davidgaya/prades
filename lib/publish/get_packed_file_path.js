'use strict';
const promisify = require('../promisify');
var temp = require('temp');
const grunt = require('grunt');
const copy_dir = promisify(require('ncp').ncp);
const pack = require('tar-pack').pack;

/*
  Converts piped function to a promise function
  that promises a target file with the pack
 */
const pack_to_file = function (source_dir, options) {
    const target_file = temp.createWriteStream();
    const promise = new Promise(function (fulfill, reject) {
        pack(source_dir, options)
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

function my_packer(temp_dir, matching_rules, options, log) {

    var getFilter = function (expanded_paths_to_pack) {
        var first = true;
        return function (entry) {
            var entry_path = entry.path.replace(/\\/g, '/');
            var relative_path = entry_path.replace(temp_dir.replace(/\\/g, '/'), '').slice(1);
            if (first) {
                first = false;
                return true;
            }
            var it_matches = expanded_paths_to_pack.indexOf(relative_path) !== -1;
            if (options.verbose) {
                log.info(it_matches ? 'match: ': 'ignore:', relative_path);
            }
            return it_matches;
        };
    };

    const original_directory = process.cwd();
    grunt.file.setBase(temp_dir);
    var list_of_files_to_pack = grunt.file.expand(matching_rules);
    grunt.file.setBase(original_directory);

    var time1 = new Date();
    return pack_to_file(temp_dir, {filter: getFilter(list_of_files_to_pack), ignoreFiles: 'no_ignore_file'})
        .then(function (packed_file) {
            var time2 = new Date();
            log.info('PACK', 'done (' + packed_file + ') took ' + ((time2 - time1) / 1000) + "seconds");
            return packed_file;
        });
}

module.exports = function get_packed_file_path(matching_rules, options, log) {
    matching_rules.push('!package.json');
    const source_dir = process.cwd();

    if (!options.debug) {
        temp = temp.track(); //this removes temp files
    }

    const temp_dir = temp.mkdirSync('prades_packer_');
    const time1 = new Date();
    return copy_dir(source_dir, temp_dir, {dereference: true}).then(function () {
        const time2 = new Date();
        log.info('COPY', 'done ('+ temp_dir + ') took ' + ((time2 - time1)/1000) + "seconds");
        return my_packer(temp_dir, matching_rules, options, log);
    });
};
