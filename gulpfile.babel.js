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

const path = require('path');
const gulp = require("gulp");
const src = gulp.src;
const dest = gulp.dest;
const watch = gulp.watch;

const glob = require('glob');
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
const smartgrid = require("smart-grid");
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
const paths = config.paths;
const dir = root + config.src;
const dist = root + config.dest;

const buildSrcList = (src, ext, folder = dir) => [
    folder + src + '**/' + ext,
    '!' + folder + src + '**/_' + ext,
];

const buildRelativePath = (dist, folder = dir) => folder + dist;

/**
 * Styles
 */
const getStylesArgs = (args = {}) => {
    let _default = {
        newer: {
            dest: buildRelativePath(args['src']) + '../',
            ext: production ? '.min.css' : '.css'
        },
        plumber: {},
        sass: {
            includePaths: [ 'node_modules', dir + paths.styles ]
        },
        groupmediaqueries: {},
        autoprefixer: {
            cascade: false,
            grid: true
        },
        mincss: {
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
        },
        rename: (path) => {
            path.dirname += "/..";
            if(production) path.extname = ".min" + path.extname;
        }
    };

    for (var arg in args) { _default[arg] = args[arg]; }
    return _default;
};

const buildStyles = function(name, _args) {
    let args = getStylesArgs(_args)
    args.debug = { title: name + ' style' }

    return src(args['src'], {allowEmpty: true, dot: true})
        .pipe(plumber(args['plumber']))
        // .pipe(gulpif(!!args['newer'] && !production, newer(args['newer'])))
        // .pipe(gulpif(!production, sourcemaps.init()))
        .pipe(sass(args['sass']))
        .pipe(groupmediaqueries(args['groupmediaqueries']))
        .pipe(autoprefixer(args['autoprefixer']))
        .pipe(gulpif(!production, browsersync.stream()))
        .pipe(gulpif(production, mincss(args['mincss'])))
        .pipe(rename(args['rename']))
        // .pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
        .pipe(plumber.stop())
        .pipe(dest(args['dest']))
        .pipe(debug(args['debug']))
        .on("end", () => production || '' == domain ? browsersync.reload : null);
};

const buildMainStyles = (args) => buildStyles('Main', {
    ...args,
    src: buildSrcList(paths.styles, ext.scss),
    dest: buildRelativePath(paths.styles)
});

const buildVendorStyles = (args) => buildStyles('Vendor', {
    ...args,
    src: buildSrcList(paths.vendor, ext.scss),
    dest: buildRelativePath(paths.vendor)
});

const buildPagesStyles = (args) => buildStyles('Page', {
    ...args,
    src: buildSrcList(paths.pages, ext.scss, root).concat(['!' + dir + paths.assets + '**/*.*']),
    dest: root
});

/**
 * Scripts
 */
const buildScripts = function(done) {
    let srcJS = buildRelativePath(paths.scripts) + ext.js;
    let config = {
        entry: glob.sync(srcJS).reduce((entries, entry) => {
            var matchForRename = /([\w\d.-_\/]+)\/.source\/([\w\d_-]+)\.js$/g.exec(entry);

            if (matchForRename !== null) {
                if(typeof matchForRename[1] !== 'undefined' && typeof matchForRename[2] !== 'undefined') {
                    entries[matchForRename[1].replace(root, '') + '/' + matchForRename[2]] = entry;
                }
            }

            return entries;
        }, {}),
        output: { filename: "[name].js" },
        mode: production ? 'production' : 'development',
        devtool: production ? false : "source-map",
    }

    if(!Object.keys(config.entry).length) {
        return done();
    }

    return src(srcJS, {allowEmpty: true})
        .pipe(webpackStream(config), webpack)
        .pipe(gulpif(production, rename({suffix: ".min"})))
        .pipe(dest(root))
        .pipe(debug({"title": "Webpack"}))
        .on("end", browsersync.reload);
};

/**
 * Images
 */
const getImagesPath = (path) => {
    // path.images.push('!' + paths.src.sprites);
    // path.images.push('!' + paths.src.favicons);
    return path;
};

const buildImages = (done) =>
    src(getImagesPath(buildSrcList(paths.images, ext.img)), {allowEmpty: true})
        .pipe(rename((path) => {
            path.dirname += "/..";
        }))
        .pipe(gulpif(!production, newer(root + '**/' + ext.img)))
        .pipe(imagemin())
        .pipe(dest(root))
        .pipe(debug({"title": "Images"}));

/**
 * GRID
 */
const buildSmartGrid = () => smartgrid(buildRelativePath(paths.vendor), {
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
});

/**
 * Dev browser sync tasks
 */
const watchVendorStyles = () => buildVendorStyles({'newer': false});
const watchPagesStyles = () => buildPagesStyles({'newer': false});
const watchMainStyles = () => buildMainStyles({'newer': false});

const watchAll = function () {
    const variables = dir + paths.variables;
    const modules = dir + paths.module + '**/' + ext.scss;

    // Watch markup.
    watch(dir + paths.markup, (done) => { browsersync.reload(); return done(); });

    // Watch styles.
    watch(['!' + modules, variables], function(done) { watchVendorStyles(); watchPagesStyles(); watchMainStyles(); return done(); });
    watch(['!' + variables, modules], (done) => { watchPagesStyles(); watchMainStyles(); return done(); });
    watch(buildSrcList(paths.vendor, ext.scss).concat(['!' + variables, '!' + modules]), () => watchVendorStyles());
    watch(buildSrcList(paths.pages,  ext.scss, root).concat(['!' + variables, '!' + modules, '!' + dir + paths.styles + '**/*.*']), () => watchPagesStyles());
    watch(buildSrcList(paths.styles, ext.scss).concat(['!' + variables, '!' + modules]), () => watchMainStyles());

    // Watch javascript.
    watch(buildRelativePath(paths.scripts) + ext.js, buildScripts);

    // Watch images.
    watch([buildRelativePath(paths.images) + '**/' + ext.img], buildImages);
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

/**
 * Tasks
 */
gulp.task("build::styles", gulp.parallel(buildVendorStyles, buildPagesStyles, buildMainStyles));
gulp.task("build::scripts", buildScripts);
gulp.task("build::images", buildImages); // buildFavicons, buildSprites

/**
 * Build only
 */
gulp.task("build", gulp.parallel("build::styles", buildScripts, buildImages));

/**
 * Move assets (if yarn/npm installed them)
 */
gulp.task("install", function(done) {
    let tasks = config.vendor.map((element) => src(element.src)
        .pipe(newer(dir + element.dest.replace('/*.*', '')))
        .pipe(dest(dir + element.dest))
        .pipe(debug({"title": "vendor: " + element.name}))
    );

    buildSmartGrid();
    return merge(tasks);
});

/**
 * Build with start serve/watcher
 */
gulp.task("default", gulp.series("build", gulp.parallel(watchAll, serve)));
