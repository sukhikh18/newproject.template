"use strict";

module.exports = {
    /** {String} Path to the source directory. Target is root + src + ${*.*} */
    src: '',
    /** {String} Path to the destination directory. Target is root + dest + ${*.*} */
    dest: '',

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
            src:  false,
            dest: 'assets/',
        },

        webpack: {
            src:  'assets/_source/',
            dest: 'assets/',
        },

        images: {
            src:  'img/HD/',
            dest: 'img/',
        },
    }
}
