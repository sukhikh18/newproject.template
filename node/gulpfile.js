'use strict';

const domain = 'test.lc';
const dir = '../public_html/';

const assets = dir + 'assets/';
// styles for watch only
const styles = dir + 'styles/';
const js     = dir + 'assets/';
const images = dir + 'img/';
const fonts  = dir + 'assets/fonts/';

const syncConf = {
    proxy: domain,
    tunnel: false
};
// for pretty code
const r = {stream: true};


const gulp = require('gulp'),
    // gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    // code
    rigger = require('gulp-rigger'),
    // sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    // style
    sass = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-clean-css'),
    // image
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    // watch changes
    watcher = require('gulp-watch'),
    // server
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    // clear images
    rimraf = require('rimraf');

/**
 * Set patches
 */
let watch = {
    code: [dir + '**/*.html'],
    css:  [dir + '**/*.scss'],
    img:  [images + 'raw/**/*.*'],
    js:   [js + 'raw/**/*.js'],
    font: [fonts + '*.*']
}

// @todo think about push dir + '*.*' for htaccess, favicon..
let src = {
    code: [dir + '**/*.html'],
    css:  [dir + '**/*.scss'],
    img:  [images + 'raw/**/*.*'],
    js:   [js + 'raw/**/*.js'],
    font: [fonts + '*.*']
}

let build = {
    code: dir,
    css:  dir,
    img:  images,
    js:   js,
    font: fonts,
}

let bs = {
    css:  styles + 'bootstrap.scss',
    js:   js + 'bootstrap.js',
    opts: styles + '_site-settings.scss',
}

// exclude snippets/includes
src.code.push('!' + dir + 'include/**/*');
src.css.push( '!' + styles + '**/*' );
src.js.push( '!' + bs.js );

// exclude boostrap
watch.css.push('!' + bs.css);
watch.js.push('!' + bs.js);


console.log( watch.css );
/**
 * Tasks
 */
gulp.task('build::code', function () {
    gulp.src(src.code)
    // .pipe(rigger())
    // .pipe(gulp.dest(build.code))
        .pipe(reload(r));
});

gulp.task('build::style', function () {
    gulp.src(src.css)
        // .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer())
        .pipe(cssmin())
        // do not rename for proxy (bitrix for ex.)
        // .pipe(rename({
        //     suffix: '.min'
        // }))
        // .pipe(sourcemaps.write())
    .pipe(gulp.dest(build.css))
        .pipe(reload(r));
});

gulp.task('build::js', function () {
    gulp.src(src.js)
        .pipe(rigger())
        // .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        // .pipe(sourcemaps.write())
    .pipe(gulp.dest(build.js))
        .pipe(reload(r));
});

gulp.task('build::image', function () {
    gulp.src(src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
    .pipe(gulp.dest(build.img))
        .pipe(reload(r));
});

// move only
gulp.task('build::font', function() {
    gulp.src(src.font)
        .pipe(gulp.dest(build.font));
});


/**
 * Build bootstrap (use after bower)
 */
gulp.task('vbuild::bootstrap-style', function () {
    gulp.src( bs.css )
        // .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin()) // minify/uglify
        .pipe(rename({
            suffix: '.min'
        }))
        // .pipe(sourcemaps.write())
    .pipe(gulp.dest(assets))
        .pipe(reload(r));
});

gulp.task('vbuild::bootstrap-script', function () {
    gulp.src( bs.js )
        .pipe(rigger())
        // .pipe(sourcemaps.init())
        .pipe(uglify())
        // .pipe(sourcemaps.write())
        .pipe(rename({
            suffix: '.min'
        }))
    .pipe(gulp.dest(build.js))
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
    gulp.src('bower_components/jquery/dist/jquery.min.js')
        .pipe(gulp.dest(build.js))

    // gulp.src('bower_components/fancybox/dist/*.*')
    //     .pipe(gulp.dest(build.code + 'assets/fancybox/'))

    // gulp.src('bower_components/slick-carousel/slick/**/*.*')
    //     .pipe(gulp.dest(build.code + 'assets/slick/'))

    // gulp.src('bower_components/masonry-layout/dist/**/*.*')
    //     .pipe(gulp.dest(build.code + 'assets/masonry/'))

    // gulp.src('bower_components/jquery-countTo/jquery.countTo.js')
    //     .pipe(uglify())
    //     .pipe(rename({
    //         suffix: '.min'
    //     }))
    //     .pipe(gulp.dest(build.code + 'assets/count-to/'))

    // gulp.src('bower_components/jquery-countTo/jquery.countTo.js')
    //     .pipe(gulp.dest(build.code + 'assets/count-to/'))
});

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
