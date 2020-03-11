"use strict";

const root = './public_html/';
const subDomain = 'nikolays93';

/** {String} Domain for use local server proxy */
const domain = '';

const ext = {
    scss: '*.scss',
    js: '*.js',
    img: '*.{jpg,jpeg,png,gif,svg}'
};

const gulp = require("gulp");
const src = gulp.src;
const dest = gulp.dest;
const watch = gulp.watch;

const gulpif = require("gulp-if");
const browsersync = require("browser-sync");
const rename = require("gulp-rename");
const map = require("map-stream");
const replace = require("gulp-replace");
const merge = require('merge-stream');
const plumber = require("gulp-plumber");
const debug = require("gulp-debug");
const yargs = require("yargs");
const autoprefixer = require("gulp-autoprefixer");
const sass = require("gulp-sass");
const groupmediaqueries = require("gulp-group-css-media-queries");
// const postcss = require("gulp-postcss");
// const mqpacker = require("css-mqpacker");
// const sortCSSmq = require("sort-css-media-queries");
const mincss = require("gulp-clean-css");
// const sourcemaps = require("gulp-sourcemaps");
const newer = require("gulp-newer");
// const favicons = require("gulp-favicons");
// const svgSprite = require("gulp-svg-sprite");
const imagemin = require("gulp-imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminZopfli = require("imagemin-zopfli");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminGiflossy = require("imagemin-giflossy");
// const imageminWebp = require("imagemin-webp");
// const webp = require("gulp-webp");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");

/** @type bool */
const production = !!yargs.argv.production;
const tunnel = !!yargs.argv.tunnel;

const config = require(root + ".config");
const dir = root + config.src;
const dist = root + config.dest;

var webpackConfig = ((webpack) => {
    webpack.mode = production ? 'production' : 'development';
    webpack.devtool = production ? false : "source-map";

    for (var key in webpack.entry) {
        webpack.entry[ key ] = dir + webpack.entry[ key ];
    }

    return webpack;
})(config.webpack);

const paths = (( paths ) => {

    paths.markup = dir + paths.markup;

    if( paths.vendor ) {
        paths.vendor.styles = [
            '!' + dir + paths.vendor.src + '**/_' + ext.scss,
                  dir + paths.vendor.src + '**/' + ext.scss,
        ];

        paths.vendor.scripts = [
            '!' + dir + paths.vendor.src + '**/_' + ext.js,
                  dir + paths.vendor.src + '**/' + ext.js,
        ];
    }

    if( paths.pages ) {
        paths.pages.styles = [
            '!' + dir + paths.pages.src + '**/_' + ext.scss,
                  dir + paths.pages.src + '**/' + ext.scss,
        ];
    }

    paths.main = {
        styles: [
            '!' + dir + paths.styles.src + '**/_' + ext.scss,
                  dir + paths.styles.src + '**/' + ext.scss,
        ],
        scripts: [
            '!' + dir + paths.scripts.src + '**/_' + ext.js,
                  dir + paths.scripts.src + '**/' + ext.js,
        ]
    };

    return paths;
})( config.paths );

const getStylesArgs = (args = {}, buildPath) => {
    let _default = {
        'newerOnly': false,
        'newer': {
            dest: buildPath,
            ext: production ? '.min.css' : '.css'
        },
        'plumber': {},
        'sass': {
            includePaths: [
                'node_modules',
                dir + paths.assets + 'scss'
            ]
        },
        'groupmediaqueries': {},
        'autoprefixer': {
            browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"]
        },
        'mincss': {
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
        },
        'rename': {
            suffix: ".min"
        },
        'debug': {
            "title": "CSS files"
        }
    };

    for (var arg in args) { _default[arg] = args[arg]; }
    return _default;
};

const getStylesPath = (path) => {
    if( '' === path ) { // @todo @check How easy?
        path.push( '!' + paths.vendor.path + '**/*' )
        path.push( '!' + paths.pages.path + '**/*' )
    }

    return path;
};

const buildStyles = function(srcPath, buildPath, _args) {
    let args = getStylesArgs(_args, buildPath);

    return src(getStylesPath(srcPath), {allowEmpty: true})
        .pipe(plumber(args['plumber']))
        .pipe(gulpif(!!args['newerOnly'] && !production, newer(args['newer'])))
        // .pipe(gulpif(!production, sourcemaps.init()))
        .pipe(sass(args['sass']))
        .pipe(groupmediaqueries(args['groupmediaqueries']))
        .pipe(gulpif(production, autoprefixer(args['autoprefixer'])))
        .pipe(gulpif(!production, browsersync.stream()))
        .pipe(gulpif(production, mincss(args['mincss'])))
        .pipe(gulpif(production, rename(args['rename'])))
        // .pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
        .pipe(plumber.stop())
        .pipe(dest(buildPath))
        .pipe(debug(args['debug']))
        .on("end", () => production || '' == domain ? browsersync.reload : null);
};

const configureScripts = function(done) {
    src(dir + paths.pages.src + '**/script.js', {allowEmpty: true})
        .pipe(map( (file, done) => {
            const separator = '/';
            let path = file.relative.replace('\\', separator);

            webpackConfig.entry[ 'page-' + path.split(separator)[0] ] = dir + paths.pages.src + path.replace('.js', '');
        } ));

    return done();
};

const buildMainScripts = function(done) {
    return src(dir + paths.pages.src + '**/script.js', {allowEmpty: true})
        .pipe(webpackStream(webpackConfig), webpack)
        .pipe(rename(function (file) {
            if( file.basename.match(/^page-/i) ) {
                file.dirname = paths.pages.dest + file.basename.replace(/^page-/i, '').replace('.js', '');
                if( '.map' !== file.extname ) {
                    file.basename = 'script';
                }
            }
            else {
                file.dirname = file.basename.match(/^main/i) ? paths.scripts.dest : paths.vendor.dest;
            }
        }))
        .pipe(gulpif(production, rename({suffix: ".min"})))
        .pipe(dest(dist))
        .pipe(debug({"title": "Webpack"}))
        .on("end", browsersync.reload);
};

const getImagesPath = (path) => {
    // path.images.push('!' + paths.src.sprites);
    // path.images.push('!' + paths.src.favicons);
    return path;
};

const buildImages = function (srcPath, buildPath) {
    return src(getImagesPath(srcPath), {allowEmpty: true})
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
        .pipe(debug({"title": "Images"}))
        .on("end", browsersync.reload);
};

const buildVendorStyles  = (done, n = 1) => ! paths.vendor.src ? done() :
    buildStyles(paths.vendor.styles, dist + paths.vendor.dest, {newerOnly: n});

const buildMainStyles    = (done, n = 1) => ! paths.styles.src ? done() :
    buildStyles(paths.main.styles, dist + paths.styles.dest, {newerOnly: n});

const buildBlocksStyles  = (done, n = 1) => ! paths.pages.src ? done() :
    buildStyles(paths.pages.styles, root + paths.pages.dest, {newerOnly: n});

const buildMainImages    = (done) => ! paths.images.src ? done() :
    buildImages([ dir + paths.images.src + '**/' + ext.img ], dist + paths.images.dest);

const buildBlocksImages  = (done) => ! paths.pages.src ? done() :
    buildImages([ dir + paths.pages.src + '**/' + ext.img ], root + paths.pages.dest);

const watchAll = function () {
    // Watch markup.
    watch(paths.markup, (done) => {
        browsersync.reload();
        return done();
    });

    const settings = dir + paths.styles.settings;

    // Watch styles.
    watch([ settings ], function(done) {
        buildVendorStyles(done, 0);
        buildMainStyles(done, 0);
        buildBlocksStyles(done, 0);
        return done();
    });

    watch([ ...paths.vendor.styles, ...['!' + settings] ], (done) => buildVendorStyles(done, 0) );
    watch([ ...paths.main.styles, ...['!' + settings] ], (done) => buildMainStyles(done, 0) );
    watch([ dir + paths.module + '**/' + ext.scss, '!' + settings ], (done) => {
        buildMainStyles(done, 0);
        buildBlocksStyles(done, 0);
        return done();
    });

    // Watch javascript.
    let scripts = [];
    for(var key in webpackConfig.entry) {
        scripts.push(webpackConfig.entry[key] + '.js');
    }
    watch(scripts, buildMainScripts);

    // Watch images.
    if(paths.images.src) watch([ dir + paths.images.src + '**/' + ext.img ], buildMainImages);

    // Watch pages.
    if(paths.pages.src) {
        watch(paths.pages.styles, buildBlocksStyles);
        watch([ dir + paths.pages.src + '**/' + ext.img ], buildBlocksImages);
    }
};

const serve = function () {
    var serverCfg = {
        port: 9000,
        notify: false
    }

    if( tunnel ) serverCfg.tunnel = subDomain;

    if( '' !== domain ) serverCfg.proxy = domain;
    else serverCfg.server = {baseDir: dist};

    browsersync.init(serverCfg);
};

gulp.task("buildStyles", gulp.parallel(buildVendorStyles, buildBlocksStyles, buildMainStyles));
gulp.task("buildImages", gulp.parallel(buildBlocksImages, buildMainImages)); // buildFavicons, buildSprites

/**
 * Build only
 */
gulp.task("build", gulp.series(configureScripts, gulp.parallel("buildStyles", "buildImages"), buildMainScripts));

/**
 * Move assets (if yarn/npm installed them)
 */
gulp.task("install", function(done) {
    let tasks = config.vendor.map((element) => src(element.src)
        .pipe(newer(dist + element.dest))
        .pipe(dest(dist + element.dest))
        .pipe(debug({"title": "vendor: " + element.name}))
    );

    return merge(tasks);
});

/**
 * Build with start serve/watcher
 */
gulp.task("default", gulp.series("build", gulp.parallel(watchAll, serve)));