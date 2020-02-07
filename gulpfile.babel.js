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
const replace = require("gulp-replace");
const merge = require('merge-stream');
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

const config = (() => {
    let conf = require(root + ".config");

    // prepare webpack config
    conf.webpack = ((webpack) => {
        webpack.mode = production ? 'production' : 'development';
        webpack.devtool = production ? false : "source-map";

        for (var key in webpack.entry) {
            webpack.entry[ key ] = root + conf.src + webpack.entry[ key ];
        }

        return webpack;
    })( conf.webpack );

    return conf;
})();

const dir = root + config.src;
const dist = root + config.dest;

const paths = (( paths ) => {
    paths.arr = {};

    paths.webpack.src.forEach((element, index) => {
        paths.webpack.src[ index ] = dir + element;
    });

    if( paths.html ) {
        paths.arr.html = [
            dir + '**/' + paths.html,
            '!' + dir + '**/_' + paths.html,
            '!' + dir + paths.assets + '**/' + paths.html
        ];
    }

    if( paths.pug ) {
        paths.arr.pug = [
            dir + '**/' + paths.pug,
            '!' + dir + '**/_' + paths.pug,
            '!' + dir + paths.assets + '**/' + paths.pug
        ];
    }

    return paths;
})( config.paths );

const buildHtml = (done) => !paths.arr.html ? done() :
    src(paths.arr.html, {allowEmpty: true})
    .pipe(rigger())
    .pipe(replace("@min", production ? ".min" : ''))
    .pipe(rename({basename: "index"}))
    .pipe(dest(dist))
    .pipe(debug({ "title": "RAW to HTML" }));

const buildPug = (done) => !paths.arr.pug ? done() :
    src(paths.arr.pug, {allowEmpty: true})
    .pipe(pug({
        pretty: "    ",
        basedir: dir
    }))
    .pipe(replace("@min", production ? ".min" : ''))
    .pipe(rename({basename: "index"}))
    .pipe(dest(dist))
    .pipe(debug({"title": "PUG to HTML"}));

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
    path.push('!' + dir + '**/_' + ext.scss);

    if( '' === path ) { // @todo @check How easy?
        path.push( '!' + paths.vendor.path + '**/*' )
        path.push( '!' + paths.blocks.path + '**/*' )
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

const getScriptsArgs = (args = {}, buildPath) => {
    let _default = {
        'newerOnly': false,
        'newer': {
            dest: buildPath,
            ext: production ? '.min.js' : '.js'
        },
        'plumber': {},
        'rigger': {},
        'uglify': {},
        'rename': {
            suffix: ".min"
        },
        'sourcemaps': "./maps/",
        'debug': {
            "title": "JS files"
        }
    };

    for (var arg in args) { _default[arg] = args[arg]; }
    return _default;
};

const getScriptsPath = (path) => {
    path.push('!' + dir + '**/_' + ext.js);

    if( '' === path ) { // @todo @check How easy?
        path.push( '!' + paths.vendor.src + '**/*' )
        path.push( '!' + paths.blocks.src + '**/*' )
    }

    return path;
};

const buildScripts = (srcPath, buildPath, _args = {}) => {
    let args = getScriptsArgs(_args, buildPath);

    return src(getScriptsPath(srcPath), { allowEmpty: true })
        .pipe(plumber(args['plumber']))
        .pipe(gulpif(!!args['newerOnly'] && !production, newer(args['newer'])))
        .pipe(rigger(args['rigger']))
        .pipe(gulpif(!production, sourcemaps.init()))
        .pipe(gulpif(production, uglify(args['uglify'])))
        .pipe(gulpif(production, rename(args['rename'])))
        .pipe(gulpif(!production, sourcemaps.write(args['sourcemaps'])))
        .pipe(plumber.stop())
        .pipe(dest(buildPath))
        .pipe(debug(args['debug']))
        .on("end", browsersync.reload);
};

const getImagesPath = (path) => {
    // path.images.push('!' + paths.src.sprites);
    // path.images.push('!' + paths.src.favicons);
    return path;
}

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
}


const buildVendorStyles  = (done, n = 1) => paths.vendor.src ? done() :
    buildStyles([ dir + paths.vendor.src + ext.scss ], dist + paths.vendor.dest, {newerOnly: n});

const buildMainStyles    = (done, n = 1) => false === paths.styles.src ? done() :
    buildStyles([ dir + paths.styles.src + '**/' + ext.scss ], dist + paths.styles.dest, {newerOnly: n});

const buildBlocksStyles  = (done, n = 1) => ! paths.blocks.src ? done() :
    buildStyles([ dir + paths.blocks.src + '**/' + ext.scss ], dist + paths.blocks.dest, {newerOnly: n});

// @todo maybe need newer?
const buildMainScripts   = (done, n = 1) => ! paths.webpack.src ? done() :
    src(paths.webpack.src, {allowEmpty: true})
    .pipe(webpackStream(config.webpack), webpack)
    .pipe(gulpif(production, rename({ suffix: ".min" })))
    .pipe(rename(function (currentPath) {
        currentPath.dirname = currentPath.basename.match(/^main/i) ? paths.webpack.dest : paths.vendor.dest;
    }))
    .pipe(dest(dist))
    .pipe(debug({ "title": "Webpack" }))
    .on("end", browsersync.reload);

const buildBlocksScripts = (done, n = 1) => ! paths.blocks.src ? done() :
    buildScripts([ dir + paths.blocks.src + '**/' + ext.js ], dist + paths.blocks.dest, {newerOnly: n});

const buildMainImages    = (done) => ! paths.images.src ? done() :
    buildImages([ dir + paths.images.src + '**/' + ext.img ], dist + paths.images.dest);

const buildBlocksImages  = (done) => ! paths.blocks.src ? done() :
    buildImages([ dir + paths.blocks.src + '**/' + ext.img ], dist + paths.blocks.dest);

// const buildFaviconImages = function () {
//     return src(paths.src.favicons, { allowEmpty: true })
//         .pipe(newer(paths.build.favicons))
//         .pipe(favicons({
//             icons: {
//                 appleIcon: true,
//                 favicons: true,
//                 online: false,
//                 appleStartup: false,
//                 android: false,
//                 firefox: false,
//                 yandex: false,
//                 windows: false,
//                 coast: false
//             }
//         }))
//         .pipe(dest(paths.build.favicons))
//         .pipe(debug({
//             "title": "Favicons"
//         }));
// }

const watchAll = function () {
    // Watch markup.
    if( paths.html ) watch([ dir + '**/' + paths.html ], buildHtml);
    if( paths.pug ) watch([ dir + '**/' + paths.pug ], buildPug);
    watch([ dir + '**/*.html' ], function htmlChangedReload(done) {
        browsersync.reload();
        return done();
    });

    // Watch styles.
    const settings = dir + paths.styles.src + '_site-settings.scss';

    watch([ settings ], function(done) {
        buildVendorStyles(done, 0);
        buildMainStyles(done, 0);
        buildBlocksStyles(done, 0);
        return done();
    });

    watch([ dir + paths.vendor.src + '**/' + ext.scss, '!' + settings ], (done) => buildVendorStyles(done, 0) );
    watch([ dir + paths.styles.src + '**/' + ext.scss, '!' + settings ], (done) => buildMainStyles(done, 0) );
    watch([ dir + paths.module + '**/' + ext.scss, '!' + settings ], (done) => {
        buildMainStyles(done, 0);
        buildBlocksStyles(done, 0);
        return done();
    });

    // Watch javascript.
    watch(paths.webpack.src, buildMainScripts);

    // Watch images.
    if(paths.images.src) watch([ dir + paths.images.src + '**/' + ext.img ], buildMainImages);

    // Watch pages.
    if(paths.blocks.src) {
        watch([ dir + paths.blocks.src + '**/' + ext.scss ], buildBlocksStyles);
        watch([ dir + paths.blocks.src + '**/' + ext.js ], buildBlocksScripts);
        watch([ dir + paths.blocks.src + '**/' + ext.img ], buildBlocksImages);
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

gulp.task("buildCode", gulp.parallel(buildHtml, buildPug));
gulp.task("buildStyles", gulp.parallel(buildVendorStyles, buildBlocksStyles, buildMainStyles));
gulp.task("buildScripts", gulp.parallel(buildBlocksScripts, buildMainScripts));
gulp.task("buildImages", gulp.parallel(buildBlocksImages, buildMainImages)); // buildFavicons, buildSprites

/**
 * Build only
 */
gulp.task("build", gulp.parallel("buildCode", "buildStyles", "buildScripts", "buildImages"));

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
