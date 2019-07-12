"use strict";

const root = './public_html/';
const subDomain = 'nikolays93';

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

const { domain, dir, dist, assets, scss, js, img, raw, assetslist, autoPrefixerConf, cleanCSSConf } = require(root + "config");
const production = !!yargs.argv.production;
const tunnel = !!yargs.argv.tunnel;

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
        assets: dist + assets,
    },
    src: {
        html:     [ dir + '**/' + htmlExt ],
        pug:      [ dir + '**/' + pugExt ],
        styles:   [ dir + scss + '**/' + scssExt ],
        scripts:  [ dir + jsSource + jsExt ],
        images:   [ dir + imageSource + '**/' + imgExt ],
        sprites:  [ dir + imageSource + 'icons/**/*.svg' ],
        favicons: [ dir + imageSource + 'icons/favicon.' + imgExt ],
        assets:   [ dir + assets + raw + '*.scss', '!' + dir + assets + raw + '_*.scss' ],
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

const buildStyles = (srcPath, buildPath, needNewer = false) => src(srcPath, { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulpif(needNewer, newer({dest: buildPath, ext: 'css'})))
    // .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass())
    .pipe(groupmediaqueries())
    .pipe(gulpif(production, autoprefixer(autoPrefixerConf)))
    .pipe(gulpif(!production, browsersync.stream()))
    .pipe(gulpif(production, mincss(cleanCSSConf)))
    .pipe(gulpif(production, rename({ suffix: ".min" })))
    .pipe(plumber.stop())
    // .pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
    .pipe(dest(buildPath))
    .pipe(debug({ "title": "CSS files" }))
    .on("end", () => production || '' == domain ? browsersync.reload : null);

const buildScripts = (srcPath, buildPath, needNewer = false) => src(srcPath, { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulpif(needNewer, newer(buildPath)))
    .pipe(rigger())
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(gulpif(production, uglify()))
    .pipe(gulpif(production, rename({
        suffix: ".min"
    })))
    .pipe(gulpif(!production, sourcemaps.write("./maps/")))
    .pipe(plumber.stop())
    .pipe(dest(buildPath))
    .pipe(debug({ "title": "JS files" }))
    .on("end", browsersync.reload);

const buildImages = (srcPath, buildPath) => src(srcPath, { allowEmpty: true })
    .pipe(newer(buildPath))
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
    .pipe(dest(buildPath))
    .pipe(debug({ "title": "Images" }))
    .on("end", browsersync.reload);

const moveFiles = (srcPath, buildPath, name) => {
    src(srcPath, { allowEmpty: true })
        .pipe(newer(buildPath))
        .pipe(dest(buildPath))
        .pipe(debug({ "title": name }));
}

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

export const buildMainStyles  = () => buildStyles(paths.src.styles, paths.build.styles);
export const buildAssetsStyle = () => buildStyles(paths.src.assets, paths.build.assets);
export const buildPagesStyle = () => buildStyles(dir + assets + 'pages/**/' + scssExt, dist + 'pages/', true);

export const buildMainScripts = () => buildScripts(paths.src.scripts, paths.build.scripts, true);
export const buildPagesScripts = () => buildScripts(dir + assets + 'pages/**/' + jsExt, dist + 'pages/', true);

export const buildMainImages  = () => buildImages(paths.src.images, paths.build.images);
export const buildPagesImages  = () => buildImages(dir + assets + 'pages/**/' + imgExt, dist + 'pages/');

export const moveAssets = (e) => {
    assetslist.forEach(function(item, i, arr) {
        moveFiles(item.src, dist + assets + item.dest, item.name);
    });

    return e();
};

export const server = () => {
    var serverCfg = {
        port: 9000,
        notify: false
    }

    if( tunnel ) {
        serverCfg.tunnel = subDomain;
    }

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
    watch(paths.watch.styles,  buildMainStyles);
    watch(paths.watch.scripts, buildMainScripts);
    watch(paths.watch.images,  buildMainImages);

    watch(dir + assets + 'pages/**/' + scssExt,  buildPagesStyle);
    watch(dir + assets + 'pages/**/' + jsExt,  buildPagesScripts);
    watch(dir + assets + 'pages/**/' + imgExt,  buildPagesImages);
};

export const buildSource = parallel(buildHtml, buildPug);

/**
 * Move assets
 */
export const install = series(moveAssets);

/**
 * Build and stop
 */
export const build = series(buildAssetsStyle,
    parallel(buildPagesStyle, buildPagesScripts, buildPagesImages),
    parallel(buildSource, buildMainStyles, buildMainScripts, buildFavs, buildMainImages)
);

/**
 * Build and continue with watcher
 */
export const run = series(build, parallel(watchCode, server));

export default run;
