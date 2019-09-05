"use strict";

module.exports = {
    /** {String} Path to the source directory. Target is root + src + ${*.*} */
    src: '',
    /** {String} Path to the destination directory. Target is root + dest + ${*.*} */
    dest: '',

    scssExt: '*.scss',
    jsExt:   '*.js',
    imgExt:  '*.{jpg,jpeg,png,gif,svg}',
}

var paths = module.exports.paths = {
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

    webpack: {
        src:  false, // 'assets/_source/',
        dest: 'assets/',
    },

    images: {
        src:  'img/HD/',
        dest: 'img/',
    },
};

var vendor = module.exports.vendor = [
    {
        name: 'Jquery',
        src: './node_modules/jquery/dist/**/*',
        dest: paths.vendor.dest + 'jquery/'
    },
    {
        name: '@Fancyapps/fancybox',
        src: './node_modules/@fancyapps/fancybox/dist/**/*',
        dest: paths.vendor.dest + 'fancybox/'
    },
    {
        name: 'Slick-carousel',
        src: './node_modules/slick-carousel/slick/**/*',
        dest: paths.vendor.dest + 'slick/',
    },
    {
        name: 'Appear',
        src: './node_modules/appear/dist/**/*',
        dest: paths.vendor.dest + 'appear/'
    },
    {
        name: 'Lettering',
        src: './node_modules/lettering/dist/**/*',
        dest: paths.vendor.dest + 'lettering/'
    },
    { // (Required for bootstrap dropdowns)
        name: 'Popper.js',
        src: './node_modules/popper.js/dist/umd/**/*',
        dest: paths.vendor.src + 'popper.js.umd/'
    },
    {
        name: 'Botstrap js',
        src: './node_modules/bootstrap/js/dist/**/*',
        dest: paths.vendor.src + 'bootstrap/js/'
    },
    {
        name: 'Botstrap scss',
        src: './node_modules/bootstrap/scss/**/*',
        dest: paths.vendor.src + 'bootstrap/scss/'
    },
    {
        name: 'Hamburgers',
        src: './node_modules/hamburgers/_sass/hamburgers/**/*',
        dest: paths.vendor.src + 'hamburgers/'
    },
    {
        name: 'Animatewithsass',
        src: './node_modules/animatewithsass/**/*',
        dest: paths.vendor.dest + 'animatewithsass/'
    },
    {
        name: 'Cleave',
        src: './node_modules/cleave.js/dist/**/*',
        dest: paths.vendor.dest + 'cleave/'
    }
];
