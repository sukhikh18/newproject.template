"use strict";

/** @type {String} Domain for use local server proxy */
const domain = '';
/** @type {String} */
const basedir = './';
/** @type {String} Path to raw images */
const rawImages = '_high/';
/** @type {String} Raw images location */
const images = 'images/' + rawImages;
/** @type {String} */
const styles = '_source/';
/** @type {String} */
const scripts = '_source/';
/** @type {Array} */
const folders = ['./', './404/'];

/**
 * Modules
 */
const path = require('path')
const glob = require('glob')
const merge = require('merge-stream')
const browserSync = require("browser-sync")
const yargs = require("yargs")

const gulp = {
    ...require("gulp"),
    if: require("gulp-if"),
    rename: require("gulp-rename"),
    plumber: require("gulp-plumber"),
    debug: require("gulp-debug"),
    newer: require("gulp-newer"),
    autoprefixer: require("gulp-autoprefixer"),
    sass: require("gulp-sass"),
    groupCssMediaQueries: require("gulp-group-css-media-queries"),
    cleanCss: require("gulp-clean-css"),
    imagemin: require("gulp-imagemin"),
    // const favicons = require("gulp-favicons"),
    // const svgSprite = require("gulp-svg-sprite"),
    // const webp = require("gulp-webp"),
}

const imagemin = {
    Pngquant: require("imagemin-pngquant"),
    Zopfli: require("imagemin-zopfli"),
    Mozjpeg: require("imagemin-mozjpeg"),
    Giflossy: require("imagemin-giflossy"),
    // Webp = require("imagemin-webp"),
}

const webpack = {
    ...require("webpack"),
    stream: require("webpack-stream"),
}

/** @type {bool} If production build */
const production = !!yargs.argv.production;
/** @type {Object} */
const serve = {
    tunnel: !!yargs.argv.tunnel ? yargs.argv.tunnel : false,
    port: 9000,
    notify: false,
    ...(domain ? {proxy: domain} : {server: {baseDir: basedir}})
}

function getExtension(expression, path = '') {
    switch (expression) {
        case 'markup':
            return path + '*.{htm,html,php}';
        case 'style':
            return path + '*.scss';
        case 'script':
            return path + '*.js';
        case 'images':
            return path + '*.{jpg,jpeg,png,gif,svg,JPG,JPEG,PNG,GIF,SVG}';
    }
}

/** @type {Array}<ResourceObject> */
const resources = (function (sources) {
    const resources = sources.map(function (value, i, arr) {
        return {
            markup: value,
            style: value + styles + '**/',
            script: value + scripts + '**/',
            images: value + images + '**/',
        }
    });

    return resources;
})(folders);

function reloadBrowser(done) {
    browserSync.reload();
    return done();
}

function pathUnderscoreRule(path, ext) {
    return [
        '!' + path + '_' + ext,
        path + ext
    ];
}

function buildArray(resources, index, method, minify, done) {
    resources.map(function (resource, i, arr) {
        if (resource[index]) {
            done = method(pathUnderscoreRule(resource[index], getExtension(index)));
            if (minify) done = method(pathUnderscoreRule(resource[index], getExtension(index)), true);
        }
    });

    return typeof done === "function" ? done() : done;
}

const gulpSettings = {allowEmpty: true, base: basedir};

/**
 * Build style gulp rules.
 *
 * @param  {String}  src    Glob argument.
 * @param  {Boolean} minify If minificate required.
 */
function buildStyles(src, minify = false) {
    const includes = ['node_modules', gulpSettings.base + styles];
    const minifySettings = {
        compatibility: "*",
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
    };

    return gulp.src(src, gulpSettings)
        .pipe(gulp.plumber())
        .pipe(gulp.sass({includePaths: includes}))
        .pipe(gulp.groupCssMediaQueries())
        .pipe(gulp.autoprefixer({cascade: false, grid: true}))
        .pipe(browserSync.stream())
        .pipe(gulp.if(minify, gulp.cleanCss(minifySettings)))
        .pipe(gulp.plumber.stop())
        .pipe(gulp.rename((filename) => {
            filename.dirname += "/..";
            if (minify) filename.extname = ".min" + filename.extname;
        }))
        .pipe(gulp.dest((file) => path.resolve(file.base)))
        .pipe(gulp.debug({"title": "Styles"}))
}

/**
 * Build script gulp rules.
 *
 * @param  {String}  src    Glob argument.
 * @param  {Boolean} minify If minificate required.
 */
function buildScripts(src, minify = false) {
    const regex = new RegExp(`([\\w\\d.-_/]+)\/[\\w\\d.-_]+\/([\\w\\d.-_]+).js$`, 'g');
    const config = {
        entry: src
            .filter(entry => 0 !== entry.indexOf('!'))
            .reduce((entries, entry) => {
                glob.sync(entry).map(found => {
                    const match = regex.exec(found);
                    if (match && '_' !== match[match.length - 1][0]) {
                        entries[match[1] + '/' + match[2]] = found;
                    }
                });
                return entries;
            }, {}),
        output: {filename: "[name].js"},
        stats: 'errors-only',
        mode: !!minify ? 'production' : 'development',
        devtool: !minify ? "source-map" : false,
    }

    if (Object.keys(config.entry).length) {
        return gulp.src('nonsense', gulpSettings)
            // Start webpack when exist files.
            .pipe(webpack.stream(config), webpack)
            .pipe(gulp.if(minify, gulp.rename({suffix: ".min"})))
            .pipe(gulp.dest(basedir))
            .pipe(gulp.debug({"title": "Script"}));
    }
    // done return required.
    return gulp.src('nonsense', gulpSettings)
        .pipe(gulp.dest(basedir))
        .pipe(gulp.debug({"title": "Script"}));
}

gulp.task('build::styles', (done) => buildArray(resources, 'style', buildStyles, !!production, done));
gulp.task('build::scripts', (done) => buildArray(resources, 'script', buildScripts, !!production, done));

function buildFavicon() {
}

function buildSprites() {
}

/**
 * Lossless image optimization.
 *
 * @global basedir, rawImages.
 * @param  {String}  src   Glob argument.
 * @param  {Boolean} force Don't use newer.
 */
function optimizeImages(src, force) {
    const imageminSettings = [
        imagemin.Giflossy({
            optimizationLevel: 3,
            optimize: 3,
            lossy: 2
        }),
        imagemin.Pngquant({
            speed: 5,
            quality: [0.6, 0.8]
        }),
        imagemin.Zopfli({
            more: true
        }),
        imagemin.Mozjpeg({
            progressive: true,
            quality: 90
        }),
        gulp.imagemin.svgo({
            plugins: [
                {removeViewBox: false},
                {removeUnusedNS: false},
                {removeUselessStrokeAndFill: false},
                {cleanupIDs: false},
                {removeComments: true},
                {removeEmptyAttrs: true},
                {removeEmptyText: true},
                {collapseGroups: true}
            ]
        })
    ];

    return gulp.src(src, gulpSettings)
        .pipe(gulp.if(!force, gulp.newer(gulpSettings.base)))
        .pipe(gulp.imagemin(imageminSettings))
        .pipe(gulp.rename((filename) => {
            let raw = rawImages.replace(/\/$/, '')
            let filedata = filename.dirname.split(raw, 2)
            filename.dirname = path.join(filedata[0], filedata[1])
        }))
        .pipe(gulp.dest('./'))
        .pipe(gulp.debug({"title": "Images"}));
}

function buildArrayImages(resources, done, force = false) {
    return buildArray(resources, 'images', optimizeImages, force, done);
}

gulp.task('build::images', function (done) {
    buildFavicon();
    buildSprites();

    return buildArrayImages(resources, done);
});

gulp.task('build:all:images', function (done) {
    return buildArrayImages(resources, done, true);
});

gulp.task('watch', function (done) {
    resources.map(function (resource, i, arr) {
        /**
         * Reload browser when change markup data.
         */
        if (resource.markup) {
            const watchMarkup = getExtension('markup', resource.markup);
            // @debug.
            // console.log('--', watchMarkup, glob.sync(watchMarkup));
            gulp.watch(watchMarkup, reloadBrowser);
        }

        if (resource.style) {
            const watchStyles = getExtension('style', resource.style);
            // @debug.
            // console.log('--', watchStyles, glob.sync(watchStyles));
            gulp.watch(watchStyles, () =>
                buildArray([resource], 'style', buildStyles, false, done));
        }

        if (resource.script) {
            const watchScripts = getExtension('script', resource.script);
            // @debug.
            // console.log('--', watchScripts, glob.sync(watchScripts));
            gulp.watch(watchScripts, () =>
                buildArray([resource], 'script', buildScripts, false, done));
        }

        if (resource.images) {
            const watchImages = getExtension('images', resource.images);
            // @debug.
            // console.log('--', watchImages, glob.sync(watchImages));
            gulp.watch(watchImages, () => buildArrayImages([resource], done));
        }
    });
});

/**
 * Build only
 */
gulp.task("build", gulp.parallel("build::styles", "build::scripts", "build::images"));

/**
 * Start serve/watcher
 */
gulp.task("default", gulp.parallel("watch", () => browserSync.init(serve)));