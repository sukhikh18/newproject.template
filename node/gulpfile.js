'use strict';

const public_folder = '../public_html';

const gulp = require('gulp'),
    rename = require('gulp-rename'),
    // code
    rigger = require('gulp-rigger'),
    // sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    // style
    sass = require('gulp-sass'),
    // prefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-clean-css'),
    // image
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    // watch changes
    watch = require('gulp-watch'),
    // server
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    // clear images
    rimraf = require('rimraf');


// for pretty code
const r = {stream: true};
const dir = {
    build: '../public_html/',
    src: '../source/',
    base: './../public_html'
}

const srvConfig = {
    server: {
        baseDir: dir.base
    },
    tunnel: false,
    host: 'localhost',
    port: 8080,
    logPrefix: 'gulp'
};

let path = {
    src: {
        // root only
        code: dir.src + '*.html',
        css: dir.src + 'template_styles.scss',
        js: dir.src + 'assets/main.js',
        img: dir.src + 'img/**/*.*',
        font: dir.src + 'assets/fonts/*.*'
    },
    build: {
        code: dir.build,
        css: dir.build,
        js: dir.build + 'assets/js/',
        img: dir.build + 'img/',
        font: dir.build + 'assets/fonts/'
    },
    watch: {
        code: dir.src + '**/*.html',
        css: [dir.src + 'template_styles.scss', dir.src + 'styles/**/*.scss'],
        js: dir.src + 'assets/main.js',
        img: dir.src + 'img/**/*.*',
        font: dir.src + 'assets/fonts/*.*'
    }
}

gulp.task('build::code', function () {
    gulp.src(path.src.code)
        .pipe(rigger())
    .pipe(gulp.dest(path.build.code))
        .pipe(reload(r));
});

gulp.task('build::style', function () {
    gulp.src(path.src.css)
        // .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        // .pipe(prefixer())
        .pipe(cssmin())
        // .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
        .pipe(reload(r));
});

gulp.task('build::js', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        // .pipe(sourcemaps.init())
        // .pipe(uglify())
        // .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
        .pipe(reload(r));
});

gulp.task('build::image', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
    .pipe(gulp.dest(path.build.img))
        .pipe(reload(r));
});

// move only
gulp.task('build::font', function() {
    gulp.src(path.src.font)
        .pipe(gulp.dest(path.build.font));
});

gulp.task('watch', function() {
    watch(path.watch.code, function(event, cb) {
        gulp.start('build::code');
    });

    watch(path.watch.css, function(event, cb) {
        gulp.start('build::style');
    });

    watch([path.watch.js], function(event, cb) {
        gulp.start('build::js');
    });

    watch([path.watch.img], function(event, cb) {
        gulp.start('build::image');
    });

    watch([path.watch.font], function(event, cb) {
        gulp.start('build::font');
    });

    watch([dir.src + 'styles/bootstrap/**/*.scss', dir.src + 'styles/_site-settings.scss'], function(event, cb) {
        gulp.start('vbuild::bootstrap-style');
    });

    watch([dir.src + 'assets/bootstrap.js'], function(event, cb) {
        gulp.start('vbuild::bootstrap-script');
    });
});


/**
 * build vendor packages (use after bower)
 */
gulp.task('vbuild::bootstrap-style', function () {
    gulp.src(dir.src + 'styles/bootstrap/bootstrap.scss')
        // .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin()) // minify/uglify
        .pipe(rename({
            suffix: '.min'
        }))
        // .pipe(sourcemaps.write())
    .pipe(gulp.dest(dir.build + 'assets/'))
        .pipe(reload(r));
});

gulp.task('vbuild::bootstrap-script', function () {
    gulp.src(dir.src + 'assets/bootstrap.js')
        .pipe(rigger())
        // .pipe(sourcemaps.init())
        .pipe(uglify())
        // .pipe(sourcemaps.write())
        .pipe(rename({
            suffix: '.min'
        }))
    .pipe(gulp.dest(path.build.js))
        .pipe(reload(r));
});

/**
 * Bower migrations
 */
gulp.task('move::jquery', function () {
    gulp.src('bower_components/jquery/dist/jquery.min.js')
        .pipe(gulp.dest(path.build.js))
});

gulp.task('move::fancybox', function () {
    gulp.src('bower_components/fancybox/dist/*.*')
        .pipe(gulp.dest(path.build.js + 'fancybox/'))
});

gulp.task('move::slick', function () {
    gulp.src('bower_components/slick-carousel/slick/**/*.*')
        .pipe(gulp.dest(path.build.js + 'slick/'))
});

gulp.task('move::masonry', function () {
    gulp.src('bower_components/masonry-layout/dist/**/*.*')
        .pipe(gulp.dest(path.build.js + 'masonry/'))
});

gulp.task('webserver', function () {
    browserSync(srvConfig);
});

gulp.task('clean', function (cb) {
    rimraf(dir.base, cb);
});


// build project
gulp.task('build', [
    'build::code',
    'build::js',
    'build::style',
    'build::font',
    'build::image',
]);

gulp.task('install', [
    'vbuild',
    'build::code',
    'build::js',
    'build::style',
    'build::font',
    'build::image',
]);

// move vendor packages
gulp.task('vbuild', [
    'move::jquery',
    'move::fancybox',
    'move::slick',
    'move::masonry',
]);

// build bootstrap
gulp.task('vbuild::bootstrap', [
    'vbuild::bootstrap-style',
    'vbuild::bootstrap-script',
]);

gulp.task('default', ['watch', 'vbuild::bootstrap', 'build', 'webserver']);