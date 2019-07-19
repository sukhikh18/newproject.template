"use strict";

const root = './public_html/';
const subDomain = 'nikolays93';

/** {String} Domain for use local server proxy */
const domain = '';

const gulp = require("gulp");
const src = gulp.src;
const dest = gulp.dest;
const watch = gulp.watch;
const parallel = gulp.parallel;
const series = gulp.series;

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
const webpack = require("webpack");
const webpackStream = require("webpack-stream");

/** @type bool */
const production = !!yargs.argv.production;
const tunnel = !!yargs.argv.tunnel;

/** @type Object {
    String:  assets, module,
    Object:  blocks, vendor, styles, script, images
} */
const config  = require(root + "config");
const paths = config.paths;

const webpackConfig = require('./webpack.config.js');
webpackConfig.mode = production ? 'production' : 'development';
webpackConfig.devtool = production ? false : "source-map";

/** @type String */
const dir   = config.src;
const dist  = config.dest;

const scssExt = config.scssExt;
const jsExt   = config.jsExt;
const imgExt  = config.imgExt;

const buildStyles = function (srcPath, buildPath, needNewer) {
    srcPath.push ('!' + dir + '**/_' + scssExt);

    return src(srcPath, { allowEmpty: true })
        .pipe(plumber())
        .pipe(gulpif(needNewer, newer({dest: buildPath, ext: production ? '.min.css' : '.css'})))
        // .pipe(gulpif(!production, sourcemaps.init()))
        .pipe(sass())
        .pipe(groupmediaqueries())
        .pipe(gulpif(production, autoprefixer({ browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"] })))
        .pipe(gulpif(!production, browsersync.stream()))
        .pipe(gulpif(production, mincss({
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
        })))
        .pipe(gulpif(production, rename({ suffix: ".min" })))
        .pipe(plumber.stop())
        // .pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
        .pipe(dest(buildPath))
        .pipe(debug({ "title": "CSS files" }))
        .on("end", () => production || '' == domain ? browsersync.reload : null);
}

const buildScripts = function (srcPath, buildPath, needNewer) {
    srcPath.push('!' + dir + '**/_' + jsExt);

    return src(srcPath, { allowEmpty: true })
        .pipe(plumber())
        .pipe(gulpif(needNewer, newer({dest: buildPath, ext: production ? '.min.js' : '.js'})))
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
    // srcPath.images.push('!' + paths.src.sprites);
    // srcPath.images.push('!' + paths.src.favicons);

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

const buildHtml = function (done) {
    if( !paths.html ) return done();

    var srcPath = [ dir + '**/' + paths.html ];

    srcPath.push('!' + dir + '**/_' + paths.html);
    srcPath.push('!' + dir + paths.assets + '**/' + paths.html);

    return src( srcPath, { allowEmpty: true })
        .pipe(rigger())
        .pipe(replace("@min", production ? ".min" : ''))
        .pipe(rename({ basename: "index" }))
        .pipe(dest(dist))
        .pipe(debug({ "title": "RAW to HTML" }))
        .on("end", browsersync.reload);
}

const buildPug = function (done) {
    if( !paths.pug ) return done();

    var srcPath = [ dir + '**/' + paths.pug ];

    srcPath.push('!' + dir + '**/_' + paths.pug);
    srcPath.push('!' + dir + paths.assets + '**/' + paths.pug);

    return src( srcPath, { allowEmpty: true })
        .pipe(pug({
            pretty: "    ",
            basedir: dir
        }))
        .pipe(replace("@min", production ? ".min" : ''))
        .pipe(rename({ basename: "index" }))
        .pipe(dest(dist))
        .pipe(debug({ "title": "PUG to HTML" }))
        .on("end", browsersync.reload);
}

const buildVendorStyles    = function ($cb, $n=1) { return buildStyles([ dir + paths.vendor.src + scssExt ], dist + paths.vendor.dest, $n); }
const buildMainStyles      = function ($cb, $n=1) { return buildStyles([ dir + paths.styles.src + '**/' + scssExt ], dist + paths.styles.dest, $n); }
const buildBlocksStyles    = function ($cb, $n=1) { return buildStyles([ dir + paths.blocks.src + '**/' + scssExt ], dist + paths.blocks.dest, $n); }

const buildVendorScripts = function () { return buildScripts([ dir + paths.vendor.src + jsExt ], dist + paths.vendor.dest, true); }
const buildMainScripts   = function () { return buildScripts([ dir + paths.script.src + '**/' + jsExt ], dist + paths.script.dest, true); }
const buildBlocksScripts = function () { return buildScripts([ dir + paths.blocks.src + '**/' + jsExt ], dist + paths.blocks.dest,  true); }

const buildMainImages    = function () { return buildImages([ dir + paths.images.src + '**/' + imgExt ], dist + paths.images.dest); }
const buildBlocksImages  = function () { return buildImages([ dir + paths.blocks.src + '**/' + imgExt ], dist + paths.blocks.dest); }

gulp.task("buildScriptsWebpack", function() {
    return src(dir + paths.webpack.src + '**/' + jsExt, { allowEmpty: true })
        .pipe(webpackStream(webpackConfig), webpack)
        .pipe(gulpif(production, rename({ suffix: ".min" })))
        .pipe(dest(dist + paths.webpack.dest))
        .pipe(debug({ "title": "Webpack" }))
        .on("end", browsersync.reload);
});

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
    if( paths.html ) watch([ dir + '**/' + paths.html ], buildHtml);
    if( paths.pug ) watch([ dir + '**/' + paths.pug ], buildPug);

    watch([ dir + paths.vendor.src + '**/' + jsExt ], buildVendorScripts );
    watch([ dir + paths.script.src + '**/' + jsExt ], buildMainScripts );
    watch([ dir + paths.blocks.src + '**/' + jsExt ], buildBlocksScripts );
    watch([ dir + paths.webpack.src + '**/' + jsExt ], series("buildScriptsWebpack") );

    const settings = dir + paths.styles.src + '_site-settings.scss';

    watch( [ settings ], function(cb) {
        buildVendorStyles(cb, 0);
        buildMainStyles(cb, 0);
        buildBlocksStyles(cb, 0);
        return cb();
    } );

    watch([ dir + paths.vendor.src + '**/' + scssExt ], function reBuildVendorStyles(cb) {
        return buildVendorStyles(cb, 0);
    } );

    watch( [ dir + paths.styles.src + '**/' + scssExt, '!' + settings ], function reBuildMainStyles(cb) {
        return buildMainStyles(cb, 0);
    } );

    watch( [ dir + paths.modules + '**/' + scssExt ], function reBuildStylesByModules(cb) {
        buildMainStyles(cb, 0);
        buildBlocksStyles(cb, 0);
        return cb();
    } );

    watch( [ dir + paths.blocks.src + '**/' + scssExt ], buildBlocksStyles );

    watch( [ dir + paths.images.src + '**/' + imgExt ], buildMainImages );
    watch( [ dir + paths.blocks.src + '**/' + imgExt ], buildBlocksImages );
};

const serve = function () {
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

gulp.task("buildCode", parallel(buildHtml, buildPug));
gulp.task("buildStyles", parallel(buildVendorStyles, buildBlocksStyles, buildMainStyles));
gulp.task("buildScripts", parallel(buildVendorScripts, buildBlocksScripts, buildMainScripts, series("buildScriptsWebpack")));
gulp.task("buildImages", parallel(buildBlocksImages, buildMainImages)); // buildVendorImages, buildFaviconImages, buildSpriteImages

/**
 * Build only
 */
gulp.task("build", parallel("buildCode", "buildStyles", "buildScripts", "buildImages"));

/**
 * Move assets (if yarn/npm installed them)
 */
gulp.task("install", function(done) {
    const assetslist = [
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
            name: 'Swiper',
            src: './node_modules/swiper/dist/**/*',
            dest: paths.vendor.dest + 'swiper/'
        },
    ];

    assetslist.forEach(function(item, i, arr) {
        moveFiles(item.src, dist + item.dest, item.name);
    });

    return done();
});

/**
 * Build with start serve/watcher
 */
gulp.task("default", series("build", parallel(watchAll, serve)));
