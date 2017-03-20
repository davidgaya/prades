'use strict';
const fs = require('fs');
const path = require('path').posix;
const assert = require('assert');
const promisify = require('./../promisify');
const unlink = promisify(fs.unlink);

module.exports = function (base_path) {
    assert(base_path);
    try {
        fs.statSync(base_path);
    } catch (e) {
        if (e.code === "ENOENT") {
            fs.mkdirSync(base_path);
        } else {
            throw(e);
        }
    }

    const create_file_stream = (file) => {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(file);
            stream.on('error', err => {
                if (err.code === "ENOENT") {
                    resolve(undefined);
                } else {
                    reject(err);
                }
            });
            stream.on('open', () => {
                // This has to be delayed to yield to errors
                setTimeout(() => resolve(stream), 2);
            });

        });
    };

    const save = function (filename, stream) {
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filename);
            // this uses close because 'finish' sometimes fires before the os closes the file descriptor
            // this has to be delayed because in very rare cases even after 'close' the open file is missing content
            writer.on('close', () => setTimeout(resolve(), 300));
            writer.on('error', reject);
            writer.on('open', () => {
                stream.then(s => s.pipe(writer));
            });
        });
    };

    const convert_key_to_filename = (key) => {
        const filename = Buffer(key, 'utf8').toString('base64');
        return path.join(base_path, filename);
    };

    const del = (key) => Promise.resolve(key)
        .then(convert_key_to_filename)
        .then(unlink)
        .catch(reason => {
            if (reason.code !== 'ENOENT') {
                throw(reason);
            }
        });

    const read = (key) => Promise.resolve(key)
        .then(convert_key_to_filename)
        .then(create_file_stream);

    const write = (key, stream) => Promise.resolve(key)
        .then(convert_key_to_filename)
        .then(filename => save(filename, stream))
        .then(() => read(key));

    return {
        write: write,
        del: del,
        read: read
    };
};
