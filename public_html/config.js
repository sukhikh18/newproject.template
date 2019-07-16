"use strict";

module.exports = {
    /** {String} Path to the directory */
    src: './public_html/',
    dest: './public_html/',

    scssExt: '*.scss',
    jsExt:   '*.js',
    imgExt:  '*.{jpg,jpeg,png,gif,svg}',

    paths: {
        assets: 'assets/',
        module: 'assets/module/',

        html: false, // index.raw.html
        pug: 'index.pug',

        blocks: {
            src: 'assets/pages/',
            dest: 'pages/',
        },

        vendor: {
            src:  'assets/vendor/_source/',
            dest: 'assets/vendor/',
        },

        styles: {
            src:  'assets/_source/',
            dest: 'assets/',
        },

        script: {
            src:  'assets/_source/',
            dest: 'assets/',
        },

        images: {
            src:  'img/_source/',
            dest: 'img/',
        },
    }
}
