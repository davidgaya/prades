'use strict';

const fs = require('fs');

module.exports = function (grunt) {

    grunt.initConfig({});

    grunt.registerTask('compileHelp', 'Compiles the Readme Markdown to terminal format.', function () {
        const marked = require('marked');
        const TerminalRenderer = require('marked-terminal');

        marked.setOptions({
            renderer: new TerminalRenderer()
        });

        const m = marked(fs.readFileSync('./Readme.md').toString());
        fs.writeFileSync('./doc/readme.term', m);
    });

    grunt.registerTask('default', ['compileHelp']);
};
