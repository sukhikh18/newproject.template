'use strict';

const domain = ''; // localhost.lc
const dir = '../public_html/';

const assets = dir + 'assets/';
const styles = dir + 'styles/';
const js     = dir + 'assets/';
const img    = dir + 'img/';
const fonts  = dir + 'assets/fonts/';
const source = '_source/';

let syncConf = {
    server: {
        baseDir: dir
    },
    host: 'localhost',
    port: 8080,
    tunnel: false
}

if( domain ) {
    syncConf = {
        proxy: domain,
        tunnel: false
    };
}

const gulp = require('gulp'),
    // gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    // code
    rigger = require('gulp-rigger'),
    sourcemaps = require('gulp-sourcemaps'),
    // js
    // babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    // style
    sass     = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'),
    cssmin   = require('gulp-clean-css'),
    // image
    imagemin       = require('gulp-imagemin'),
    pngquant       = require('imagemin-pngquant'),
    jpegRecompress = require("imagemin-jpeg-recompress"),
    // watch changes
    watcher  = require('gulp-watch'),
    // server
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    // clear images
    rimraf = require('rimraf'),

    // packageJson: require('./package.json'),
    // concat: require("gulp-concat"),
    // favicons: require("gulp-favicons"),
    // iconfont: require("gulp-iconfont"),
    // iconfontcss: require("gulp-iconfont-css"),
    // svgSprite: require("gulp-svg-sprites"),
    // replace: require("gulp-replace"),
    newer = require("gulp-newer"),
    plumber = require("gulp-plumber"),
    debug = require("gulp-debug");
    // clean: require("gulp-clean"),

// for pretty code
const r = {stream: true};

/**
 * Set patches
 */
let watch = {
    code: [dir + '**/*.html'],
    css:  [dir + '*.scss', styles + '**/*.scss'],
    img:  [img   + source + '**/*.*'],
    js:   [js    + source + '**/*.js'],
    font: [fonts + source + '*.*']
}

let src = {
    code: [dir + '**/*.html', '!' + assets + '**/*', '!' + dir + 'include/**/*'],
    css:  [dir + '*.scss',    '!' + assets + '**/*', '!' + styles + '**/*'],
    img:  [img   + source + '**/*.*'],
    js:   [js    + source + '**/*.js'],
    font: [fonts + source + '*.*']
}

let build = {
    code: dir,
    css:  dir,
    img:  img,
    js:   js,
    font: fonts,
}

let bs = {
    css:  styles + 'bootstrap.scss',
    js:   js + source + 'bootstrap.js',
    opts: styles + '_site-settings.scss',
}


// exclude boostrap
watch.css.push('!' + bs.css);
watch.js.push('!' + bs.js, '!' + js + source + 'bootstrap/**/*');

src.css.push('!' + bs.css);
src.js.push('!' + bs.js, '!' + js + source + 'bootstrap/**/*');

/**
 * Tasks
 */
gulp.task('build::code', function () {
    gulp.src(src.code)
    // .pipe(rigger())
    // .pipe(gulp.dest(build.code))
    .pipe(debug({"title": "build::code"}))
        .pipe(reload(r));
});

gulp.task('build::style', function () {
    gulp.src(src.css)
        .pipe(plumber())
        // .pipe(sourcemaps.init())
        .pipe(sass.sync({outputStyle: 'expanded'})) // .on('error', sass.logError)
        .pipe(prefixer({browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"]}))
        // .pipe(cssmin({compatibility: "ie8", level: {1: {specialComments: 0}}}))
        // .pipe(rename({
        //     suffix: '.min'
        // }))
        // .pipe(sourcemaps.write())
        .pipe(plumber.stop())
    .pipe(gulp.dest(build.css))
    .pipe(debug({"title": "build::style"}))
        .pipe(reload(r));
});

gulp.task('build::js', function () {
    gulp.src(src.js)
        .pipe(plumber())
        .pipe(rigger())
        // .pipe(babel({presets: ["@babel/preset-env"]}))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(build.js))
        .pipe(debug({"title": "build::js"}))
        .pipe(reload(r));
});

gulp.task('build::image', function () {
    gulp.src(src.img)
        .pipe(newer(build.img))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            jpegRecompress({loops: 1, quality: "low"}),
            imagemin.svgo(),
            imagemin.optipng({optimizationLevel: 5}),
            pngquant({quality: "65-70", speed: 5})
        ]))
    .pipe(gulp.dest(build.img))
        .pipe(debug({"title": "build::image"}))
        .pipe(reload(r));
});

// move only
gulp.task('build::font', function() {
    gulp.src(src.font)
    .pipe(gulp.dest(build.font))
        .pipe(debug({"title": "build::font"}));
});


/**
 * Build bootstrap (use after bower)
 */
gulp.task('vbuild::bootstrap-style', function () {
    gulp.src( bs.css )
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin()) // minify/uglify
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(assets))
        .pipe(debug({"title": "vbuild::bootstrap-style"}))
        .pipe(reload(r));
});

gulp.task('vbuild::bootstrap-script', function () {
    gulp.src( bs.js )
        .pipe(plumber())
        .pipe(rigger())
        .pipe(sourcemaps.init())
        // .pipe(babel()) // {presets: ["@babel/preset-env"]}
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(build.js))
        .pipe(debug({"title": "vbuild::bootstrap-script"}))
        .pipe(reload(r));
});

gulp.task('watch', function() {
    watcher(watch.code, function(event, cb) {
        gulp.start('build::code');
    });

    watcher(watch.css, function(event, cb) {
        gulp.start('build::style');
    });

    watcher(watch.js, function(event, cb) {
        gulp.start('build::js');
    });

    watcher(watch.img, function(event, cb) {
        gulp.start('build::image');
    });

    watcher(watch.font, function(event, cb) {
        gulp.start('build::font');
    });

    // Bootstrap
    watcher([ bs.css, bs.opts ], function(event, cb) {
        gulp.start('vbuild::bootstrap-style');
    });

    watcher([ bs.js ], function(event, cb) {
        gulp.start('vbuild::bootstrap-script');
    });
});

/**
 * Bower migrations
 */
gulp.task('move::assets', function () {
    gulp.src('bower_components/bootstrap/js/dist/*.js')
        .pipe(gulp.dest(assets + source + 'bootstrap/js/'))
        .pipe(debug({"title": "move::bootstrapJS"}));

    gulp.src('bower_components/bootstrap/scss/**/*.scss')
        .pipe(gulp.dest(assets + source + 'bootstrap/scss/'))
        .pipe(debug({"title": "move::bootstrapSCSS"}));

    gulp.src('bower_components/popper.js/dist/umd/popper.js')
        .pipe(gulp.dest(assets + 'popper.js/'))
        .pipe(debug({"title": "move::popper"}));

    gulp.src('bower_components/jquery/dist/jquery.min.js')
        .pipe(gulp.dest(build.js))
        .pipe(debug({"title": "move::jquery"}));

    gulp.src('bower_components/fancybox/dist/*.*')
        .pipe(gulp.dest(assets + 'fancybox/'))
        .pipe(debug({"title": "move::fancybox"}));

    gulp.src('bower_components/slick-carousel/slick/**/*.*')
        .pipe(gulp.dest(assets + 'slick/'))
        .pipe(debug({"title": "move::slick"}));

    gulp.src('bower_components/sticky/jquery.sticky.js')
        .pipe(gulp.dest(assets + 'sticky/'))
        .pipe(debug({"title": "move::sticky"}));

    gulp.src(assets + 'sticky/jquery.sticky.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(assets + 'sticky/'))
        .pipe(debug({"title": "vbuild::sticky"}));

    // need `bower install masonry-layout`
    // gulp.src('bower_components/masonry-layout/dist/**/*.{css,js}')
    //     .pipe(gulp.dest(assets + 'masonry/'))

    // need `bower install jquery-countTo`
    // gulp.src('bower_components/jquery-countTo/jquery.countTo.js')
    //     .pipe(gulp.dest(assets + 'count-to/'))

    // gulp.src(assets + 'count-to/jquery.countTo.js')
    //     .pipe(uglify())
    //     .pipe(rename({
    //         suffix: '.min'
    //     }))
    //     .pipe(gulp.dest(assets + 'count-to/'))
});

// @todo add move htaccess..

gulp.task('webserver', function () {
    browserSync(syncConf);
});

// build project
gulp.task('build', [
    'build::code',
    'build::js',
    'build::style',
    'build::font',
    'build::image',
]);

// build bootstrap
gulp.task('vbuild::bootstrap', [
    'vbuild::bootstrap-style',
    'vbuild::bootstrap-script',
]);

gulp.task('install', [
    'move::assets',
    // 'build',
]);

// gulp.task('clean', function (cb) {
//     rimraf(dir.base, cb);
// });

gulp.task('default', ['watch', 'vbuild::bootstrap', 'build', 'webserver']);
