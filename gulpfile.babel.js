"use strict";

/** @type {String} Domain for use local server proxy */
const domain = '';
const basedir = './';
/** @type {String} */
const source = '_source/';
/** @type {String} Path to raw images */
const rawImages = '_high/';
/** @type {String} Raw images location */
const images = 'images/' + rawImages;
const styles = 'sass/';
const scripts = 'js/' + source;
/** @type {String} Path to vendor assets */
const vendor = 'vendor/assets/';

const folders = ['./', './404/'];
/** @type {Array} Move src files to vendor */
const vendorList = [
    { name: 'Jquery', src: './node_modules/jquery/dist/**/*.*' },
    { name: 'Bootstrap', src: './node_modules/bootstrap/dist/js/*.*' },
    { name: 'Slick', src: './node_modules/slick-carousel/slick/**/*.*' },
    { name: 'Fancybox', src: './node_modules/@fancyapps/fancybox/dist/**/*.*' },
    // @note: use `yarn add waypoints` for install
    { name: 'Waypoints', src: './node_modules/waypoints/lib/**/*.*' }
];

/**
 * Modules
 */
const path = require('path')
const glob = require('glob')
const merge = require('merge-stream')
const browserSync = require("browser-sync")
const yargs = require("yargs")
const smartgrid = require("smart-grid")

const gulp = {
    ...require("gulp"),
    if: require("gulp-if"),
    rename: require("gulp-rename"),
    replace: require("gulp-replace"),
    plumber: require("gulp-plumber"),
    debug: require("gulp-debug"),
    autoprefixer: require("gulp-autoprefixer"),
    sass: require("gulp-sass"),
    groupCssMediaQueries: require("gulp-group-css-media-queries"),
    cleanCss: require("gulp-clean-css"),
    newer: require("gulp-newer"),
    imagemin: require("gulp-imagemin"),
    // const sourcemaps = require("gulp-sourcemaps"),
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
/** @type {Bool} If production build */
const production = !!yargs.argv.production;
/** @type {Object} */
const serve = {
    tunnel: !!yargs.argv.tunnel ? yargs.argv.tunnel : false,
    port: 9000,
    notify: false,
    ...(domain ? { proxy: domain } : { server: { baseDir: basedir } })
}

function getExtension(expression, path = '') {
    switch (expression) {
        case 'markup': return path + '*.{htm,html,php}';
        case 'style':  return path + '*.scss';
        case 'script': return path + '*.js';
        case 'images': return path + '*.{jpg,jpeg,png,gif,svg,JPG,JPEG,PNG,GIF,SVG}';
    }
}

/** @type {Array}<ResourceObject> */
const resources = (function(sources) {
    const resources = sources.map(function(value, i, arr) {
        return {
            markup: value,
            style: value + styles + '**/',
            script: value + scripts + '**/',
            images: value + images + '**/',
        }
    });
    // Add vendor source.
    resources.push({
        markup: null,
        style: './' + vendor + source + '**/',
        script: null,
        images: null,
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
    resources.map(function(resource, i, arr) {
        if (resource[index]) {
            done = method(pathUnderscoreRule(resource[index], getExtension(index)));
            if (minify) done = method(pathUnderscoreRule(resource[index], getExtension(index)), true);
        }
    });

    return done();
}

/**
 * Build style gulp rules.
 *
 * @global basedir, production.
 * @param  {String}  src    Glob argument.
 * @param  {Boolean} minify If minificate required.
 */
function buildStyles(src, minify = false) {
    const settings = { allowEmpty: true, base: basedir };
    const includes = ['node_modules', settings.base + styles, settings.base + vendor];

    return gulp.src(src, settings)
        .pipe(gulp.plumber())
        .pipe(gulp.rename((filename) => {
            filename.dirname += "/..";
            if (minify) filename.extname = ".min" + filename.extname;
        }))
        // .pipe(gulp.sourcemaps())
        .pipe(gulp.sass({ includePaths: includes }))
        .pipe(gulp.groupCssMediaQueries())
        .pipe(gulp.autoprefixer({ cascade: false, grid: true }))
        .pipe(gulp.if(!minify, browserSync.stream()))
        .pipe(gulp.if(minify, gulp.cleanCss({
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
        })))
        // .pipe(gulp.if(!minify, gulp.sourcemaps.write("./assets/maps/")))
        .pipe(gulp.plumber.stop())
        .pipe(gulp.dest((file) => path.resolve(file.base)))
        .pipe(gulp.debug({ "title": "Styles" }))
        .on("end", () => minify || '' == domain ? browserSync.reload : null)
}

/**
 * Build script gulp rules.
 *
 * @global source.
 * @param  {String}  src    Glob argument.
 * @param  {Boolean} minify If minificate required.
 */
function buildScripts(src, minify = false) {
    const regex = new RegExp(`([\\w\\d.-_/]+)${source}([\\w\\d._-]+).js$`, 'g');
    const findMatches = (entries, entry) => {
        if (0 !== entry.indexOf('!')) {
            glob.sync(entry).forEach((found) => {
                // @type { 0: path to _source, 1: basename (without ext) } match
                const match = regex.exec(found)
                if (match) {
                    entries[match[1] + '/' + match[2]] = found
                }
            })
        }

        return entries;
    }

    const config = {
        entry: src.reduce(findMatches, {}),
        output: { filename: "[name].js" },
        stats: 'errors-only',
        mode: minify ? 'production' : 'development',
        // devtool: minify ? false : "source-map",
    }

    if (Object.keys(config.entry).length) {
        gulp.src('nonsense', { allowEmpty: true })
            .pipe(webpack.stream(config), webpack)
            .pipe(gulp.if(minify, gulp.rename({ suffix: ".min" })))
            .pipe(gulp.dest('./'))
            .pipe(gulp.debug({ "title": "Script" }))
    }
}

gulp.task('build::styles', (done) => buildArray(resources, 'style', buildStyles, !!production, done));
gulp.task('build::scripts', (done) => buildArray(resources, 'script', buildScripts, !!production, done));

function buildFavicon() {}

function buildSprites() {}

/**
 * Lossless image optimization.
 *
 * @global basedir, rawImages.
 * @param  {String}  src   Glob argument.
 * @param  {Boolean} force Don't use newer.
 */
function optimizeImages(src, force) {
    const settings = { allowEmpty: true, base: basedir };

    return gulp.src(src, settings)
        .pipe(gulp.rename((filename) => {
            let raw = rawImages.replace(/\/$/, '')
            let filedata = filename.dirname.split(raw, 2)
            filename.dirname = path.join(filedata[0], filedata[1])
        }))
        .pipe(gulp.if(!force, gulp.newer(settings.base)))
        .pipe(gulp.imagemin([
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
        ]))
        .pipe(gulp.dest('./'))
        .pipe(gulp.debug({ "title": "Images" }));
}

function buildArrayImages(resources, done, force = false) {
    buildArray(resources, 'images', optimizeImages, force, done);
}

gulp.task('build::images', function(done) {
    buildFavicon();
    buildSprites();

    buildArrayImages(resources, done);
});

gulp.task('build:all:images', function(done) {
    buildArrayImages(resources, done, true);
});

gulp.task('watch', function(done) {
    resources.map(function(resource, i, arr) {
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

const compileSmartGrid = (buildSrc) => smartgrid(buildSrc, {
    outputStyle: "scss",
    filename: "_smart-grid",
    columns: 12, // number of grid columns
    offset: "1.875rem", // gutter width - 30px
    mobileFirst: true,
    mixinNames: {
        container: "container"
    },
    container: {
        fields: "0.9375rem" // side fields - 15px
    },
    breakPoints: {
        xs: {
            width: "20rem" // 320px
        },
        sm: {
            width: "36rem" // 576px
        },
        md: {
            width: "48rem" // 768px
        },
        lg: {
            width: "62rem" // 992px
        },
        xl: {
            width: "75rem" // 1200px
        }
    }
})

/**
 * @global vendorList {Array}<{name, src}>
 */
gulp.task("install", function(done) {
    // Compile grid sass mixin.
    compileSmartGrid(basedir + vendor + source);

    // Replace assets to project when exists (installed).
    return merge(vendorList.map((elem) => {
        let destination = basedir + vendor + elem.name.toLowerCase();

        return gulp.src(elem.src)
            .pipe(gulp.newer(destination))
            .pipe(gulp.dest(destination))
            .pipe(gulp.debug({ "title": "Vendor: " + elem.name }));
    }));
});

/**
 * Build only
 */
gulp.task("build", gulp.parallel("build::styles", "build::scripts", "build::images"));

/**
 * Start serve/watcher
 */
gulp.task("default", gulp.parallel("watch", () => browserSync.init(serve)));