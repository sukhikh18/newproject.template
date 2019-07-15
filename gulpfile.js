"use strict";

const root = './public_html/';
const subDomain = 'nikolays93';

// const webpack = require("webpack");
// const webpackStream = require("webpack-stream");
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

const config  = require(root + "config");
const domain  = config.domain;
const dir     = config.dir;
const dist    = config.dist;
const assets  = config.assets;
const vendor  = config.vendor;
const modules = config.modules;
const pages   = config.pages;
const script  = config.script;
const images  = config.images;
const raw     = config.raw;

const production = !!yargs.argv.production;
const tunnel = !!yargs.argv.tunnel;

const htmlExt = 'index.raw.html';
const pugExt  = 'index.pug.html';
const scssExt = '*.scss';
const jsExt   = '*.js';
const imgExt  = '*.{jpg,jpeg,png,gif,svg}';

const buildStyles = function (srcPath, buildPath, needNewer = false) {
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

const buildScripts = function (srcPath, buildPath, needNewer = false) {
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

const buildHtml = function () {
    var srcPath = [ dir + '**/' + htmlExt ];

    srcPath.push('!' + dir + '**/_' + htmlExt);
    srcPath.push('!' + dir + assets + '**/' + htmlExt);

    return src( srcPath, { allowEmpty: true })
        .pipe(rigger())
        .pipe(replace("@min", production ? ".min" : ''))
        .pipe(rename({ basename: "index" }))
        .pipe(dest(dist))
        .pipe(debug({ "title": "RAW to HTML" }))
        .on("end", browsersync.reload);
}

const buildPug = function () {
    var srcPath = [ dir + '**/' + pugExt ];

    srcPath.push('!' + dir + '**/_' + pugExt);
    srcPath.push('!' + dir + assets + '**/' + pugExt);

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

const buildVendorStyle   = function () { return buildStyles([ dir + vendor + raw   + scssExt ], dist + vendor, true); }
const buildMainStyles    = function () { return buildStyles([ dir + assets + raw   + '**/' + scssExt ], dist + assets, true); }
const buildPagesStyle    = function () { return buildStyles([ dir + assets + pages + '**/' + scssExt ], dist + pages, true); }

const buildVendorScripts = function () { return buildScripts([ dir + vendor + raw   + jsExt ], dist + vendor, true); }
const buildMainScripts   = function () { return buildScripts([ dir + assets + raw   + '**/' + jsExt ], dist + assets, true); }
const buildPagesScripts  = function () { return buildScripts([ dir + assets + pages + '**/' + jsExt ], dist + pages,  true); }

const buildMainImages    = function () { return buildImages([ dir + images + raw + '**/' + imgExt ], dist + images); }
const buildPagesImages   = function () { return buildImages([ dir + assets + pages + '**/' + imgExt ], dist + pages); }


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
    watch([ dir + '**/' + htmlExt ], buildHtml);
    watch([ dir + '**/' + pugExt ], buildPug);

    watch([ dir + vendor + raw + '**/' + jsExt ], buildVendorScripts );
    watch([ dir + assets + raw + '**/' + jsExt ], buildMainScripts );
    watch([ dir + assets + pages + '**/' + jsExt ], buildPagesScripts );

    watch( [ dir + assets + raw + '_site-settings.scss' ], buildVendorStyle )
    watch( [ dir + assets + raw + '**/' + scssExt, dir + modules + '**/' + scssExt ], buildMainStyles );
    watch( [ dir + assets + pages + '**/' + scssExt, dir + modules + '**/' + scssExt ], buildPagesStyle );

    watch( [ dir + images + raw + '**/' + imgExt ], buildMainImages );
    watch( [ dir + assets + pages + '**/' + imgExt ], buildPagesImages );
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
gulp.task("buildStyles", parallel(buildVendorStyle, buildPagesStyle, buildMainStyles));
gulp.task("buildScripts", parallel(buildVendorScripts, buildPagesScripts, buildMainScripts));
gulp.task("buildImages", parallel(buildPagesImages, buildMainImages)); // buildVendorImages, buildFaviconImages, buildSpriteImages

/**
 * Build only
 */
gulp.task("build", parallel("buildCode", "buildStyles", "buildScripts", "buildImages"));

/**
 * Move assets (if yarn/npm installed them)
 */
gulp.task("install", function(e) {
    const assetslist = [
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
            dest: raw + 'popper.js.umd/'
        },
        {
            name: 'Botstrap js',
            src: './node_modules/bootstrap/js/dist/**/*',
            dest: raw + 'bootstrap/js/'
        },
        {
            name: 'Botstrap scss',
            src: './node_modules/bootstrap/scss/**/*',
            dest: raw + 'bootstrap/scss/'
        },
        {
            name: 'Hamburgers',
            src: './node_modules/hamburgers/_sass/hamburgers/**/*',
            dest: raw + 'hamburgers/'
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

    assetslist.forEach(function(item, i, arr) {
        moveFiles(item.src, dist + vendor + item.dest, item.name);
    });

    return e();
});

/**
 * Build with start serve/watcher
 */
gulp.task("default", series("install", "build", parallel(watchAll, serve)));
