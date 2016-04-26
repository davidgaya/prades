#!/usr/bin/env node
'use strict';

var program = require('commander');
var version = require('../package.json').version;

program
    .version(version);

program
    .command('install')
    .description('download and install binaries')
    .option('-v, --verbose', 'Be verbose')
    .action(install);

program
    .command('publish')
    .description('zip and upload binaries')
    .option('-v, --verbose', 'Be verbose')
    .action(publish);

program.parse(process.argv);

function install(options) {
    return require('../install')(options);
}

function publish(options) {
    return require('../publish')(options);
}
