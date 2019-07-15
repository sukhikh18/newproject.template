"use strict";

const root = './public_html/';
const subDomain = 'nikolays93';

// const webpack = require("webpack");
// const webpackStream = require("webpack-stream");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const browsersync = require("browser-sync");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const plumber = require("gulp-plumber");
const debug = require("gulp-debug");
const clean = require("gulp-clean");
const yargs = require("yargs");
const rigger = require("gulp-rigger");
const pug = require("gulp-pug");
const autoprefixer = require("gulp-autoprefixer");
const sass = require("gulp-sass");
const groupmediaqueries = require("gulp-group-css-media-queries");
// const postcss = require("gulp-postcss");
// const mqpacker = require("css-mqpacker");
// const sortCSSmq = require("sort-css-media-queries");
const mincss = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const newer = require("gulp-newer");
const favicons = require("gulp-favicons");
const svgSprite = require("gulp-svg-sprite");
const imagemin = require("gulp-imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminZopfli = require("imagemin-zopfli");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminGiflossy = require("imagemin-giflossy");
// const imageminWebp = require("imagemin-webp");
// const webp = require("gulp-webp");

const src = gulp.src;
const dest = gulp.dest;
const watch = gulp.watch;
const parallel = gulp.parallel;
const series = gulp.series;

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

const buildStyles = function (srcPath, buildPath, needNewer = false) {
    return src(srcPath, { allowEmpty: true })
        .pipe(plumber())
        .pipe(gulpif(needNewer, newer({dest: buildPath, ext: production ? '.min.css' : '.css'})))
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
}

const buildScripts = function (srcPath, buildPath, needNewer = false) {
    return src(srcPath, { allowEmpty: true })
        .pipe(plumber())
        .pipe(gulpif(needNewer, newer(buildPath)))
        .pipe(rigger())
        .pipe(gulpif(!production, sourcemaps.init()))
        .pipe(gulpif(production, uglify()))
        .pipe(gulpif(production, rename({ suffix: ".min" })))
        .pipe(gulpif(!production, sourcemaps.write("./maps/")))
        .pipe(plumber.stop())
        .pipe(dest(buildPath))
        .pipe(debug({ "title": "JS files" }))
        .on("end", browsersync.reload);
}

const buildImages = function (srcPath, buildPath) {
    return src(srcPath, { allowEmpty: true })
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
}

const moveFiles = function (srcPath, buildPath, name) {
    return src(srcPath, { allowEmpty: true })
        .pipe(newer(buildPath))
        .pipe(dest(buildPath))
        .pipe(debug({ "title": name }));
}

const buildHtml = function () {
    return src( paths.src.html, { allowEmpty: true })
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
}

const buildPug = function () {
    return src( paths.src.pug, { allowEmpty: true })
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
}

const buildFavs = function () {
    return src(paths.src.favicons, { allowEmpty: true })
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
}

const buildMainStyles   = function () { return buildStyles(paths.src.styles, paths.build.styles); }
const buildAssetsStyle  = function () { return buildStyles(paths.src.assets, paths.build.assets); }
const buildPagesStyle   = function () { return buildStyles(dir + assets + 'pages/**/' + scssExt, dist + 'pages/', true); }

const buildMainScripts  = function () { return buildScripts(paths.src.scripts, paths.build.scripts, true); }
const buildPagesScripts = function () { return buildScripts(dir + assets + 'pages/**/' + jsExt, dist + 'pages/', true); }

const buildMainImages   = function () { return buildImages(paths.src.images, paths.build.images); }
const buildPagesImages  = function () { return buildImages(dir + assets + 'pages/**/' + imgExt, dist + 'pages/'); }

const moveAssets = function (e) {
    assetslist.forEach(function(item, i, arr) {
        moveFiles(item.src, dist + assets + item.dest, item.name);
    });

    return e();
};

const server = function () {
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

const watchCode = function () {
    watch(paths.watch.html,    buildHtml);
    watch(paths.watch.pug,     buildPug);
    watch(paths.watch.styles,  buildMainStyles);
    watch(paths.watch.scripts, buildMainScripts);
    watch(paths.watch.images,  buildMainImages);

    watch(dir + assets + 'pages/**/' + scssExt,  buildPagesStyle);
    watch(dir + assets + 'pages/**/' + jsExt,  buildPagesScripts);
    watch(dir + assets + 'pages/**/' + imgExt,  buildPagesImages);
};

/**
 * Move assets
 */
gulp.task("install", series(moveAssets));

/**
 * Build and stop
 */
gulp.task("build", series(buildAssetsStyle,
    parallel(buildPagesStyle, buildPagesScripts, buildPagesImages),
    parallel(buildHtml, buildPug, buildMainStyles, buildMainScripts, buildFavs, buildMainImages)
));

/**
 * Build and continue with watcher
 */
gulp.task("default", series("build", parallel(watchCode, server)));
