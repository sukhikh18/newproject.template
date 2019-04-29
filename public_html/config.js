"use strict";

import { src, dest, watch, parallel, series } from "gulp";

global.dir += ''; // wp-content/themes/project/

/** @global {String}  */
global.dist = './dist/';

/** @const String Need for build eq dir */
const raw   = '_src/';

global.paths.build = {
    // clean: ["./dist/*", "./dist/.*"],
    general:  dist,
    styles:   dist,
    scripts:  dist + assets,
    images:   dist + img,
    favicons: dist + img + "favicons/",
    sprites:  dist + img + "sprites/",
};

global.paths.src = {

    html: [
            dir + '**/index.htm',
        '!'+dir + 'template-parts/**/index.htm',
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
        // '!'+dir + 'template-parts/**/index.htm',
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

/**
 * Prepare patchs
 */
global.paths.src.html.push  ('!' + dir + assets + '**/*');
global.paths.src.styles.push('!' + dir + assets + '**/*');

global.paths.src.images.push('!' + paths.src.sprites);
global.paths.src.images.push('!' + paths.src.favicons);

/**
 * Assets
 */
export const bsStyle = () => src('./node_modules/bootstrap/scss/**/*')
    .pipe(dest(dir + assets + 'bootstrap/scss/'));

export const bsScript = () => src('./node_modules/bootstrap/js/dist/**/*')
    .pipe(dest(dir + assets + 'bootstrap/js/'));

export const popper = () => src('./node_modules/popper.js/dist/umd/**/*')
    .pipe(dest(dir + assets + 'popper.js/'));

export const hamburgers = () => src('./node_modules/hamburgers/_sass/hamburgers/**/*')
    .pipe(dest(dir + assets + 'hamburgers/'));


export const fancybox = () => src('./node_modules/@fancyapps/fancybox/dist/**/*')
    .pipe(dest(dist + assets + 'fancybox/'));

export const jquery = () => src('./node_modules/jquery/dist/**/*')
    .pipe(dest(dist + assets + 'jquery/'));

export const slick = () => src('./node_modules/slick-carousel/slick/**/*')
    .pipe(dest(dist + assets + 'slick/'));


export let additionalAssetsTasks = parallel(
    popper,
    fancybox,
    hamburgers,
    jquery,
    slick
);
