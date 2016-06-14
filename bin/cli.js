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
    .option('-f, --force', 'Force publishing')
    .action(publish);

program
    .command('unpublish')
    .description('remove binary package from repo')
    .option('-v, --verbose', 'Be verbose')
    .option('-d, --debug', 'Debug')
    .option('-f, --force', 'Force publishing')
    .action(unpublish);

program
    .command('info')
    .description('show package info')
    .option('-v, --verbose', 'Be verbose')
    .action(show_info);

program.parse(process.argv);

function exit_with_error() {
    process.exit(1);
}

function install(options) {
    return require('../install')(options).catch(exit_with_error);
}

function publish(options) {
    return require('../publish')(options).catch(exit_with_error);
}

function unpublish(options) {
    return require('../unpublish')(options).catch(exit_with_error);
}

function show_info(options) {
    return require('../show_info')(options).catch(exit_with_error);
}

if (!program.args.length) {
    console.log('v', program.version());
    program.help();
}