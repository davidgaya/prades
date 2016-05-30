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

program
    .command('unpublish')
    .description('remove binary package from repo')
    .option('-v, --verbose', 'Be verbose')
    .option('-d, --debug', 'Debug')
    .action(unpublish);

program.parse(process.argv);

function install(options) {
    return require('../install')(options).catch(() => process.exit(1));
}

function publish(options) {
    return require('../publish')(options).catch(() => process.exit(1));
}

function unpublish(options) {
    return require('../unpublish')(options).catch(() => process.exit(1));
}

if (!program.args.length) {
    console.log('v', program.version());
    program.help();
}