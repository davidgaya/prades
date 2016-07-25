'use strict';
var promisify = require('./promisify');
var npm = require('npm');

/*
  This is a Promise middleware function. It takes a package.json config
  and returns the same config.
  In the middle it fails (throws error) if the version specified in the
  config already exists as a published package.
 */
module.exports = function verify_published(config) {
    var load = promisify(npm.load);
    var view = promisify(npm.view);
    var get_published_versions = function (view) {
        if (!view) {return [];}
        var latest = Object.keys(view)[0];
        return view[latest].versions;
    };
    return load()
        .then(()=>view())
        .catch(()=> null)
        .then(get_published_versions)
        .then((versions) => {
            if (versions.indexOf(config.version()) > -1) {
                throw(new Error('Publising prades binaries is frozen.\n  You cannot prades-publish after npm-publish.\n  Either update the package version or npm-unpublish first.'));
            }
        }).then(() => config);
};
