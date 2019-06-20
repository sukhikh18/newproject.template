"use strict";

/** @type {String} For use proxy */
const domain = '';

const root = './public_html/';

// import webpack from "webpack";
// import webpackStream from "webpack-stream";
import { src, dest, watch, parallel, series } from "gulp";
import gulpif from "gulp-if";
import browsersync from "browser-sync";
import rename from "gulp-rename";
import replace from "gulp-replace";
import plumber from "gulp-plumber";
import debug from "gulp-debug";
import clean from "gulp-clean";
import yargs from "yargs";
import rigger from "gulp-rigger";
import pug from "gulp-pug";
import autoprefixer from "gulp-autoprefixer";
import sass from "gulp-sass";
import groupmediaqueries from "gulp-group-css-media-queries";
// import postcss from "gulp-postcss";
// import mqpacker from "css-mqpacker";
// import sortCSSmq from "sort-css-media-queries";
import mincss from "gulp-clean-css";
import uglify from "gulp-uglify";
import sourcemaps from "gulp-sourcemaps";
import newer from "gulp-newer";
import favicons from "gulp-favicons";
import svgSprite from "gulp-svg-sprite";
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminZopfli from "imagemin-zopfli";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGiflossy from "imagemin-giflossy";
// import imageminWebp from "imagemin-webp";
// import webp from "gulp-webp";

const { dir, dist, assets, scss, js, img, raw, assetslist, autoPrefixerConf, cleanCSSConf } = require(root + "config");
const production = !!yargs.argv.production;

var serverCfg = {
    port: 9000,
    /** @type {Boolean} tunnel is proxy for multiple devices */
    tunnel: false,
    notify: false
}

/** Prepare config paths */
const imageSource = img + raw;
const jsSource    = js  + raw;

const htmlExt = 'index.raw.html';
const pugExt  = 'index.pug.html';
const scssExt = '*.scss';
const jsExt   = '*.js';
const imgExt  = '*.{jpg,jpeg,png,gif,svg}';

var paths = {
    build: {
        html:     dist,
        pug:      dist,
        styles:   dist,
        scripts:  dist + assets,
        images:   dist + img,
        sprites:  dist + img + "sprites/",
        favicons: dist + img + "favicons/",
    },
    src: {
        html:     [ dir + '**/' + htmlExt ],
        pug:      [ dir + '**/' + pugExt ],
        styles:   [ dir + scss + '**/' + scssExt ],
        scripts:  [ dir + jsSource + jsExt ],
        images:   [ dir + imageSource + '**/' + imgExt ],
        sprites:  [ dir + imageSource + 'icons/**/*.svg' ],
        favicons: [ dir + imageSource + 'icons/favicon.' + imgExt ],
    },
    watch: {
        html:     [ dir + '**/' + htmlExt ],
        pug:      [ dir + '**/' + pugExt ],
        styles:   [ dir + scss + '**/' + scssExt ],
        scripts:  [ dir + jsSource + jsExt ],
        images:   [ dir + imageSource + '**/' + imgExt ],
        sprites:  [ dir + imageSource + 'icons/**/*.svg' ],
        favicons: [ dir + imageSource + 'icons/favicon.' + imgExt ],
    }
};

/** Exclude start dashes */
paths.src.html.push   ('!' + dist + '**/_' + htmlExt);
paths.src.pug.push    ('!' + dist + '**/_' + pugExt);
paths.src.styles.push ('!' + dist + scss + '**/_' + scssExt);
paths.src.scripts.push('!' + dist + jsSource + '**/_' + jsExt);

/** Exclude assets */
paths.src.html.push  ('!' + dist + assets + '**/*');
paths.src.styles.push('!' + dist + assets + '**/*');

/** Exclude to be compiled images */
paths.src.images.push('!' + paths.src.sprites);
paths.src.images.push('!' + paths.src.favicons);

export const buildHtml = () => src( paths.src.html, { allowEmpty: true })
    .pipe(rigger())
    .pipe(replace("@min", production ? ".min" : ''))
    .pipe(rename({
        basename: "index"
    }))
    .pipe(dest(paths.build.html))
    .pipe(debug({
        "title": "HTML files"
    }))
    .on("end", browsersync.reload);

export const buildPug = () => src( paths.src.pug, { allowEmpty: true })
    .pipe(pug({
        pretty: '    ',
        basedir: dist
    }))
    .pipe(replace("@min", production ? ".min" : ''))
    .pipe(rename({
        basename: "index"
    }))
    .pipe(dest(paths.build.pug))
    .pipe(debug({
        "title": "HTML files"
    }))
    .on("end", browsersync.reload);

export const buildStyles = () => src(paths.src.styles, { allowEmpty: true })
    .pipe(plumber())
    // .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass())
    .pipe(groupmediaqueries())
    .pipe(gulpif(production, autoprefixer(autoPrefixerConf)))
    .pipe(gulpif(!production, browsersync.stream()))
    .pipe(gulpif(production, mincss(cleanCSSConf)))
    .pipe(gulpif(production, rename({ suffix: ".min" })))
    .pipe(plumber.stop())
    // .pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
    .pipe(dest(paths.build.styles))
    .pipe(debug({
        "title": "CSS files"
    }))
    .on("end", () => production || '' == domain ? browsersync.reload : null);

export const buildScripts = () => src(paths.src.scripts, { allowEmpty: true })
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(gulpif(production, uglify()))
    .pipe(gulpif(production, rename({
        suffix: ".min"
    })))
    .pipe(gulpif(!production, sourcemaps.write("./maps/")))
    // .pipe(plumber.stop())
    .pipe(dest(paths.build.scripts))
    .pipe(debug({
        "title": "JS files"
    }))
    .on("end", browsersync.reload);

export const buildImages = () => src(paths.src.images, { allowEmpty: true })
    .pipe(newer(paths.build.images))
    .pipe(gulpif(production, imagemin([
        imageminGiflossy({
            optimizationLevel: 3,
            optimize: 3,
            lossy: 2
        }),
        imageminPngquant({
            speed: 5,
            quality: 75
        }),
        imageminZopfli({
            more: true
        }),
        imageminMozjpeg({
            progressive: true,
            quality: 70
        }),
        imagemin.svgo({
            plugins: [
                { removeViewBox: false },
                { removeUnusedNS: false },
                { removeUselessStrokeAndFill: false },
                { cleanupIDs: false },
                { removeComments: true },
                { removeEmptyAttrs: true },
                { removeEmptyText: true },
                { collapseGroups: true }
            ]
        })
    ])))
    .pipe(dest(paths.build.images))
    .pipe(debug({
        "title": "Images"
    }))
    .on("end", browsersync.reload);

export const buildFavs = () => src(paths.src.favicons, { allowEmpty: true })
    .pipe(newer(paths.build.favicons))
    .pipe(favicons({
        icons: {
            appleIcon: true,
            favicons: true,
            online: false,
            appleStartup: false,
            android: false,
            firefox: false,
            yandex: false,
            windows: false,
            coast: false
        }
    }))
    .pipe(dest(paths.build.favicons))
    .pipe(debug({
        "title": "Favicons"
    }));

/**
 * Assets
 */
export const buildAssetsStyle = () => src([dist + assets + raw + '*.scss', '!' + dist + assets + raw + '_*.scss'], { allowEmpty: true })
    .pipe(plumber())
    // .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass())
    // .pipe(groupmediaqueries())
    .pipe(gulpif(production, autoprefixer(autoPrefixerConf)))
    .pipe(gulpif(production, mincss(cleanCSSConf)))
    .pipe(gulpif(production, rename({
        suffix: ".min"
    })))
    .pipe(plumber.stop())
    // .pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
    .pipe(dest(dist + assets))
    .pipe(debug({
        "title": "CSS files"
    }))
    .on("end", () => browsersync.reload);

export const moveAssets = (e) => {
    assetslist.forEach(function(item, i, arr) {
        src(item.src, { allowEmpty: true })
            .pipe(newer(dist + assets + item.dest))
            .pipe(dest(dist + assets + item.dest))
            .pipe(debug({
                "title": item.name
            }));
    });

    return e();
};

export const server = () => {
    if( '' !== domain ) {
        serverCfg.proxy = domain;
    }
    else {
        serverCfg.server = {baseDir: dist};
    }

    browsersync.init(serverCfg);
};

export const watchCode = () => {
    watch(paths.watch.html,    buildHtml);
    watch(paths.watch.pug,     buildPug);
    watch(paths.watch.styles,  buildStyles);
    watch(paths.watch.scripts, buildScripts);
    watch(paths.watch.images,  buildImages);
};

export const buildSource = parallel(buildHtml, buildPug);

/**
 * Move assets
 */
export const install = series(moveAssets);

/**
 * Build and stop
 */
export const build = series(buildAssetsStyle, parallel(buildSource, buildStyles, buildScripts, buildFavs, buildImages));

/**
 * Build and continue with watcher
 */
export const run = series(build, parallel(watchCode, server));

export default run;
