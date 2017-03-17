'use strict';

module.exports = function (base_path) {
    const store = require('levelup')(base_path);

    // all key is a promises

    const read = (key) => {
        return key.then(key => {
            return new Promise((resolve, reject) => {
                store.get(key, (err, value) => {
                    if (err) {
                        if (err.notFound) {
                            resolve(undefined);
                        }
                        reject(err);
                    }
                    resolve(value);
                });
            });
        });
    };

    const write = (key, value) => {
        return Promise.all([key, value]).then(ary => {
            const key = ary[0];
            const value = ary[1];
            return new Promise((resolve, reject) => {
                store.put(key, value, err => {
                    if (err) {
                        reject(err);
                    }
                    resolve(value);
                });
            });
        });
    };

    return {
        write: write,
        read: read
    };
};
