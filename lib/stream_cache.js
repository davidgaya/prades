'use strict';
const fs = require('fs');
const path = require('path').posix;

module.exports = function (cache, base_path) {
    base_path = base_path || 'tmp';
    try {
        fs.statSync(base_path);
    } catch (e) {
        if (e.code === "ENOENT") {
            fs.mkdirSync(base_path);
        } else {
            throw(e);
        }
    }

    const key_to_filename = (key) => {
        return Buffer.from(key, 'utf8').toString('base64');
    };

    const read = (key) => {
        const p = Promise.resolve(key); //key may or not be a promise, we ensure it
        return p.then(key => {
            // search for file 'key' in FS
            return new Promise((resolve, reject) => {
                const file = path.join(base_path, key_to_filename(key));
                fs.stat(file, (err) => {
                    if (err) {
                        if (err.code === "ENOENT") {
                            resolve(undefined);
                        } else {
                            reject(err);
                        }
                    } else {
                        const stream = fs.createReadStream(file);
                        stream.on('error', reject);
                        resolve(stream); // returns a promise of a readable
                    }
                });
            });
        });

    };
    const write = (key, stream) => {
        const p = Promise.resolve(key); //key may or not be a promise, we ensure it
        return p.then(key => {
            return new Promise((resolve, reject) => {
                // save the stream in FS
                const writer = fs.createWriteStream(path.join(base_path, key_to_filename(key)));
                writer.on('finish', () => resolve());
                writer.on('error', reject);
                stream.pipe(writer);
            });
        }).then(() => read(key)); // return a readable
    };

    return {
        write: write,
        read: read
    };
};
