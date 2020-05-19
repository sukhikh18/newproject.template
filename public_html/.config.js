"use strict";

var main = module.exports = {
    /** {String} Path to the source directory. Target is root + src + ${*.*} */
    src: '', // for ex. wp-content/themes/project/
    /** {String} Path to the destination directory. Target is root + dest + ${*.*} */
    dest: '', // for ex. wp-content/themes/project/
};

const assets = 'assets/';
const source = '.source/';
const sourceMedia = 'high/';
const sourceVendor = assets + 'vendor/';

var vendor = module.exports.vendor = [
    {
        name: 'Jquery',
        src: './node_modules/jquery/dist/**/*.*',
        dest: sourceVendor + 'jquery/'
    },
    {
        name: 'BootstrapJs',
        src: './node_modules/bootstrap/dist/js/*.*',
        dest: sourceVendor + 'bootstrap/'
    },
    {
        name: 'Cleave',
        src: './node_modules/cleave.js/dist/**/*.*',
        dest: sourceVendor + 'cleave/'
    },
    {
        name: 'Slick',
        src: './node_modules/slick-carousel/slick/**/*.*',
        dest: sourceVendor + 'slick/',
    },
    {
        name: 'Fancybox',
        src: './node_modules/@fancyapps/fancybox/dist/**/*.*',
        dest: sourceVendor + 'fancybox/'
    },
    {
        name: 'Waypoints',
        src: './node_modules/waypoints/lib/**/*.*',
        dest: sourceVendor + 'waypoints/'
    },
];

var paths = module.exports.paths = {
    assets: assets,
    module: assets + source + 'module/',
    variables: assets + source + '_site-settings.scss',

    markup: '**/*.html',

    styles: assets + source,
    vendor: sourceVendor + source,
    pages: '**/' + source,
    images: '**/' + sourceMedia,
    scripts: '**/' + source,
};
