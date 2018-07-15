'use strict';

var gulp = require('gulp'),
    // html
    rigger = require('gulp-rigger'),
    sourcemaps = require('gulp-sourcemaps'),
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
    rimraf = require('rimraf'),
    combiner = require('stream-combiner2').obj;

var dir = {
    build: 'project/',
    src: 'source/',
    base: './project'
}

var path = {
    build: {
        html: dir.build,
        js: dir.build + 'assets/',
        // css: dir.build + 'assets/css/',
        img: dir.build + 'img/',
        font: dir.build + 'assets/fonts/'
    },
    src: {
        html: dir.src + '*.html',
        js: dir.src + 'js/*.js',
        style: dir.src + 'template_styles.scss',
        img: dir.src + 'img/*.*',
        font: dir.src + 'fonts/**/*.*'
    },
    watch: {
        html: dir.src + '**/*.html',
        js: dir.src + 'js/**/*.js',
        style: [
            dir.src + 'template_styles.scss'
            ,dir.src + 'styles/**/*.scss'
        ],
        img: dir.src + 'img/**/*.*',
        font: dir.src + 'fonts/**/*.*'
    },
};

var srvConfig = {
    server: {
        baseDir: dir.base
    },
    tunnel: false,
    host: 'localhost',
    port: 8080,
    logPrefix: "new.project"
};

// for pretty code
var r = {stream: true};

gulp.task('build::html', function () {
    return combiner(
        gulp.src(path.src.html)
            ,rigger()
        ,gulp.dest(path.build.html)
            ,reload(r)
    );
});

gulp.task('build::style', function () {
    return combiner(
        gulp.src(path.src.style)
            // ,sourcemaps.init()
            ,sass().on('error', sass.logError)
            // ,prefixer()
            ,cssmin()
            // ,sourcemaps.write()
        ,gulp.dest(path.build.html)
            ,reload(r)
    );
});

gulp.task('build::js', function () {
    return combiner(
        gulp.src(path.src.js)
            ,rigger()
            // ,sourcemaps.init()
            ,uglify()
            // ,sourcemaps.write()
        ,gulp.dest(path.build.js)
            ,reload(r)
    );
});

gulp.task('build::image', function () {
    return combiner(
        gulp.src(path.src.img)
            ,imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()],
                interlaced: true
            })
        ,gulp.dest(path.build.img)
            ,reload(r)
    );
});

// move only
gulp.task('build::font', function() {
    return combiner(
        gulp.src(path.src.font)
        ,gulp.dest(path.build.font)
    );
});

gulp.task('watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('build::html');
    });

    watch(path.watch.style, function(event, cb) {
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
        gulp.start('vbuild::bootstrap');
    });
});


/**
 * build vendor packages (use after bower)
 */
gulp.task('vbuild::bootstrap', function () {
    return combiner(
        gulp.src(dir.src + 'styles/bootstrap/bootstrap.scss')
            // ,sourcemaps.init()
            ,sass().on('error', sass.logError)
            ,cssmin() // minify/uglify
            // ,sourcemaps.write()
        ,gulp.dest(dir.build + 'assets/')
    );
});

// move only
gulp.task('vbuild::jquery', function () {
    return combiner(
        gulp.src('bower_components/jquery/dist/jquery.min.js')
        ,gulp.dest(path.build.js)
    );
});

// move only
gulp.task('vbuild::fancybox', function () {
    return combiner(
        gulp.src('bower_components/fancybox/dist/*.*')
        ,gulp.dest(path.build.js + 'fancybox/')
    );
});

// // move only
gulp.task('vbuild::slick', function () {
    return combiner(
        gulp.src('bower_components/slick-carousel/slick/**/*.*')
        ,gulp.dest(path.build.js + 'slick/')
    );
});

// // move only
gulp.task('vbuild::masonry', function () {
    return combiner(
        gulp.src('bower_components/masonry-layout/dist/**/*.*')
        ,gulp.dest(path.build.js + 'masonry/')
    );
});

gulp.task('moveSource::html', function () {
    return combiner(
        gulp.src( dir.src + '*.html' )
        ,gulp.dest(dir.build + 'html/')
    );
});

gulp.task('moveSource::scss', function () {
    return combiner(
        gulp.src( dir.src + '**/*.scss' )
        ,gulp.dest(dir.build)
    );
});

gulp.task('webserver', function () {
    browserSync(srvConfig);
});

gulp.task('clean', function (cb) {
    rimraf(dir.base, cb);
});

// build project
gulp.task('build', [
    'build::html',
    'build::js',
    'build::style',
    'build::font',
    'build::image'
]);

// build vendor packages
gulp.task('vbuild', [
    'vbuild::jquery',
    'vbuild::bootstrap',
    'vbuild::fancybox',
    'vbuild::slick',
    'vbuild::masonry',
]);

// init project
gulp.task('install', ['vbuild', 'build']);

// start development
gulp.task('default', ['build', 'webserver', 'watch']);

// complete project (build + move source)
gulp.task('complete', ['install', 'moveSource::html', 'moveSource::scss' ]);