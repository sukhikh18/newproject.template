"use strict";

global.dir += ''; // wp-content/themes/project/
global.dist += '';

/** @const String Need for build eq dir */
const raw   = '_src/';

global.paths.build = {
    // clean: ["./dist/*", "./dist/.*"],
    styles:   dist,
    scripts:  dist + assets,
    images:   dist + img,
    favicons: dist + img + "favicons/",
    sprites:  dist + img + "sprites/",
};

global.paths.src = {

    html: [
            dir + '**/index.htm',
    ],

    php: [
        dir + '**/*.php',
    ],

    styles: [
            dir + '*.scss',
            dir + scss + '**/*.scss',
        '!'+dir + scss + '**/_*.scss',
    ],

    scripts: [
            dir + js + raw + '*.js',
        '!'+dir + js + raw + '_*.js',
    ],

    images: [
        dir + img + raw + '**/*.{jpg,jpeg,png,gif,svg}'
    ],

    sprites:  [dir + img + raw + 'icons/**/*.svg'],
    favicons: [dir + img + raw + 'icons/favicon.{jpg,jpeg,png,gif}'],
}

global.paths.watch = {

    html: [
            dir + '**/index.htm'
    ],

    styles: [
        // '!'+dir + scss + '**/_*.scss',
            dir + scss + '**/*.scss',
            dir + '*.scss'
    ],

    scripts: [
        // '!'+dir + js + raw + '_*.js',
            dir + js + raw + '*.js',
    ],

    images: [
        dir + img + raw + '**/*.{jpg,jpeg,png,gif,svg}'
    ],

    sprites:  [dir + img + raw + 'icons/**/*.svg'],
    favicons: [dir + img + raw + 'icons/favicon.{jpg,jpeg,png,gif}'],
}

global.paths.assets = [
    { // fonts
        src: dir + 'fonts/**/*',
        dest: dist + 'fonts/'
    },
    { // jquery
        src: './node_modules/jquery/dist/**/*',
        dest: dist + assets + 'jquery/'
    },
    // { // fancybox
    //     src: './node_modules/@fancyapps/fancybox/dist/**/*',
    //     dest: dist + assets + 'fancybox/'
    // },
    // { // slick
    //     src: './node_modules/slick-carousel/slick/**/*',
    //     dest: dist + assets + 'slick/',
    // },
    // { // appear
    //     './node_modules/appear/dist/**/*',
    //     dist + assets + 'appear/'
    // },
    // { // lettering
    //     './node_modules/lettering/dist/**/*',
    //     dist + assets + 'lettering/'
    // },
    { // popper (Required for dropdowns)
        src: './node_modules/popper.js/dist/umd/**/*',
        dest: dir + assets + 'popper.js/'
    },
    { // botstrap scripts
        src: './node_modules/bootstrap/js/dist/**/*',
        dest: dir + assets + 'bootstrap/js/'
    },
    { // botstrap styles
        src: './node_modules/bootstrap/scss/**/*',
        dest: dir + assets + 'bootstrap/scss/'
    },
    { // hamburgers
        src: './node_modules/hamburgers/_sass/hamburgers/**/*',
        dest: dir + assets + 'hamburgers/'
    },
    // {
    //     src: './node_modules/slick-carousel/slick/**/*',
    //     dest: dir + assets + 'slick/'
    // },
]

/**
 * Exclude assets
 */
global.paths.src.html.push  ('!' + dir + assets + '**/*');
global.paths.src.styles.push('!' + dir + assets + '**/*');

/**
 * Exclude rigger parts
 */
global.paths.src.html.push  ('!'+dir + 'template-parts/**/index.htm');

/**
 * Exclude to be compiled images
 */
global.paths.src.images.push('!' + paths.src.sprites);
global.paths.src.images.push('!' + paths.src.favicons);
