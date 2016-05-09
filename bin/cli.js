#!/usr/bin/env node
'use strict';

var program = require('commander');
var version = require('../package.json').version;

program
    .version(version)
    .description("Prades is a tool to embed large binary objects in npm packages, it works using S3 as store and a signing microservice in the npm registry.");

program
    .command('install')
    .description('download and install binaries')
    .option('-v, --verbose', 'Be verbose')
    .action(install);

program
    .command('publish')
    .description('zip and upload binaries')
    .option('-v, --verbose', 'Be verbose')
    .option('-d, --debug', 'Debug')
    .action(publish);

program.parse(process.argv);

function install(options) {
    return require('../install')(options);
}

function publish(options) {
    return require('../publish')(options);
}

if (!program.args.length) {
    console.log('v', program.version());
    program.help();
}