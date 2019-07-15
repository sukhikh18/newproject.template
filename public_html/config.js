"use strict";

/** @type {String} For use proxy */
module.exports.domain = '';


/** {String} Path to the root directory */
module.exports.dir   = './public_html/';
module.exports.dist = './public_html/';

module.exports.assets = 'assets/';
module.exports.scss   = 'scss/';
module.exports.js     = 'assets/';
module.exports.img    = 'img/';
module.exports.raw    = '_raw/';

module.exports.assetslist = [
    {
        name: 'Jquery',
        src: './node_modules/jquery/dist/**/*',
        dest: 'jquery/'
    },
    {
        name: '@Fancyapps/fancybox',
        src: './node_modules/@fancyapps/fancybox/dist/**/*',
        dest: 'fancybox/'
    },
    {
        name: 'Slick-carousel',
        src: './node_modules/slick-carousel/slick/**/*',
        dest: 'slick/',
    },
    {
        name: 'Appear',
        src: './node_modules/appear/dist/**/*',
        dest: 'appear/'
    },
    {
        name: 'Lettering',
        src: './node_modules/lettering/dist/**/*',
        dest: 'lettering/'
    },
    { // (Required for bootstrap dropdowns)
        name: 'Popper.js',
        src: './node_modules/popper.js/dist/umd/**/*',
        dest: module.exports.raw + 'popper-js/'
    },
    {
        name: 'Botstrap js',
        src: './node_modules/bootstrap/js/dist/**/*',
        dest: module.exports.raw + 'bootstrap/js/'
    },
    {
        name: 'Botstrap scss',
        src: './node_modules/bootstrap/scss/**/*',
        dest: module.exports.raw + 'bootstrap/scss/'
    },
    {
        name: 'Hamburgers',
        src: './node_modules/hamburgers/_sass/hamburgers/**/*',
        dest: module.exports.raw + 'hamburgers/'
    },
    {
        name: 'Animatewithsass',
        src: './node_modules/animatewithsass/**/*',
        dest: 'animatewithsass/'
    },
    {
        name: 'Swiper',
        src: './node_modules/swiper/dist/**/*',
        dest: 'swiper/'
    },
];

module.exports.autoPrefixerConf = {
    browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"]
};

module.exports.cleanCSSConf = {
    compatibility: "ie8",
    level: {
        1: {
            specialComments: 0,
            removeEmpty: true,
            removeWhitespace: true
        },
        2: {
            mergeMedia: true,
            removeEmpty: true,
            removeDuplicateFontRules: true,
            removeDuplicateMediaBlocks: true,
            removeDuplicateRules: true,
            removeUnusedAtRules: false
        }
    },
    rebase: false
};
