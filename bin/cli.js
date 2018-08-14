#!/usr/bin/env node
'use strict';

var fs = require('fs');
var program = require('commander');
var version = require('../package.json').version;

program
    .version(version)
    .description("Prades is a tool to embed large binary objects in npm packages, it works using S3 as store and a signing microservice in the npm registry.")
    .on('--help', more_options);

program
    .command('help')
    .description("display this help.")
    .action(help);

program
    .command('guide')
    .description("display user's guide")
    .action(guide);

program
    .command('install')
    .description('download and install binaries')
    .option('-f, --force', 'Force install')
    .option('-u, --uid [uid]', 'Unique Id')
    .action(install);

program
    .command('publish')
    .description('filter, zip and upload binaries')
    .option('-v, --verbose', 'Be verbose about what files are included.')
    .option('-d, --debug', 'Do not delete temporal file and directories.')
    .option('-f, --force', 'Force publish')
    .option('-u, --uid [uid]', 'Unique Id')
    .option('-p, --platform [platform]', 'Force platform')
    .action(publish);

program
    .command('unpublish')
    .description('remove binary package from repo')
    .option('-f, --force', 'Force unpublish')
    .option('-u, --uid [uid]', 'Unique Id')
    .option('-p, --platform [platform]', 'Force platform')
    .action(unpublish);

program
    .command('size')
    .description('retrieve package size')
    .option('-v, --verbose', 'Be verbose about what files are included.')
    .action(size);

program
    .command('info')
    .description('show package publish status (both npm and prades binaries)')
    .action(show_info);

program.parse(process.argv);

if (!program.args.length) {
    help();
}

function exit_with_error(reason) {
    console.log(reason);
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

function size(options) {
    return require('../size')(options).catch(exit_with_error);
}

function show_info(options) {
    return require('../show_info')(options).catch(exit_with_error);
}

function guide() {
    console.log('');
    console.log(fs.readFileSync(__dirname + '/../doc/readme.term').toString());
}

function help() {
    console.log('');
    console.log('Prades  v', program.version());
    program.help();
}

function more_options() {
    console.log('  Options detailed for command:');
    console.log('    prades [command] --help');
    console.log('');
}
