"use strict";

/** @type {String} For use proxy */
global.domain = '';

/** {String} Path to the root directory */
const dir   = './source/'; // wp-content/themes/project/
const dist = './public_html/';

const assets = 'assets/';
const scss   = 'styles/';
const js     = 'assets/';
const img    = 'img/';
const raw    = '_src/';

global.serverCfg = {
	port: 9000,
	/** @type {Boolean} Need proxy for multiple devices */
	tunnel: false,
	notify: false
}

// import webpack from "webpack";
// import webpackStream from "webpack-stream";
import { src, dest, watch, parallel, series } from "gulp";
import gulpif from "gulp-if";
import browsersync from "browser-sync";
import autoprefixer from "gulp-autoprefixer";
import uglify from "gulp-uglify";
import sass from "gulp-sass";
import groupmediaqueries from "gulp-group-css-media-queries";
// import postcss from "gulp-postcss";
// import mqpacker from "css-mqpacker";
// import sortCSSmq from "sort-css-media-queries";
import mincss from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import favicons from "gulp-favicons";
import svgSprite from "gulp-svg-sprite";
import replace from "gulp-replace";
import rigger from "gulp-rigger";
import plumber from "gulp-plumber";
import debug from "gulp-debug";
import clean from "gulp-clean";
import yargs from "yargs";

import newer from "gulp-newer";
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminZopfli from "imagemin-zopfli";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGiflossy from "imagemin-giflossy";
// import imageminWebp from "imagemin-webp";
// import webp from "gulp-webp";

global.paths = {};
global.production = !!yargs.argv.production;

global.paths.assets = [
    { // fonts
        src: dir + 'fonts/**/*',
        dest: dist + 'fonts/'
    },
    { // jquery
        src: './node_modules/jquery/dist/**/*',
        dest: dist + assets + 'jquery/'
    },
    // { // fancybox
    //     src: './node_modules/@fancyapps/fancybox/dist/**/*',
    //     dest: dist + assets + 'fancybox/'
    // },
    { // slick
        src: './node_modules/slick-carousel/slick/**/*',
        dest: dist + assets + 'slick/',
    },
    // { // appear
    //     './node_modules/appear/dist/**/*',
    //     dist + assets + 'appear/'
    // },
    // { // lettering
    //     './node_modules/lettering/dist/**/*',
    //     dist + assets + 'lettering/'
    // },
    { // popper (Required for dropdowns)
        src: './node_modules/popper.js/dist/umd/**/*',
        dest: dir + assets + 'popper.js/'
    },
    { // botstrap scripts
        src: './node_modules/bootstrap/js/dist/**/*',
        dest: dir + assets + 'bootstrap/js/'
    },
    { // botstrap styles
        src: './node_modules/bootstrap/scss/**/*',
        dest: dir + assets + 'bootstrap/scss/'
    },
    { // hamburgers
        src: './node_modules/hamburgers/_sass/hamburgers/**/*',
        dest: dir + assets + 'hamburgers/'
    },
    // {
    //     src: './node_modules/slick-carousel/slick/**/*',
    //     dest: dir + assets + 'slick/'
    // },
];

global.paths.build = {
    // clean: ["./dist/*", "./dist/.*"],
    styles:   dist,
    scripts:  dist + assets,
    images:   dist + img,
    favicons: dist + img + "favicons/",
    sprites:  dist + img + "sprites/",
};

global.paths.src = {

    html: [
            dir + '**/index.htm',
    ],

    php: [
        dir + '**/*.php',
    ],

    styles: [
            dir + '*.scss',
            dir + scss + '**/*.scss',
        '!'+dir + scss + '**/_*.scss',
    ],

    scripts: [
            dir + js + raw + '*.js',
        '!'+dir + js + raw + '_*.js',
    ],

    images: [
        dir + img + raw + '**/*.{jpg,jpeg,png,gif,svg}'
    ],

    sprites:  [dir + img + raw + 'icons/**/*.svg'],
    favicons: [dir + img + raw + 'icons/favicon.{jpg,jpeg,png,gif,svg}'],
};

global.paths.watch = {

    html: [
            dir + '**/index.htm'
    ],

    styles: [
        // '!'+dir + scss + '**/_*.scss',
            dir + scss + '**/*.scss',
            dir + '*.scss'
    ],

    scripts: [
        // '!'+dir + js + raw + '_*.js',
            dir + js + raw + '*.js',
    ],

    images: [
        dir + img + raw + '**/*.{jpg,jpeg,png,gif,svg}'
    ],

    sprites:  [dir + img + raw + 'icons/**/*.svg'],
    favicons: [dir + img + raw + 'icons/favicon.{jpg,jpeg,png,gif,svg}'],
};

/**
 * Exclude assets
 */
global.paths.src.html.push  ('!' + dir + assets + '**/*');
global.paths.src.styles.push('!' + dir + assets + '**/*');

/**
 * Exclude rigger parts
 */
global.paths.src.html.push  ('!'+dir + 'template-parts/**/index.htm');

/**
 * Exclude to be compiled images
 */
global.paths.src.images.push('!' + paths.src.sprites);
global.paths.src.images.push('!' + paths.src.favicons);


/**
 * Style settings
 */
const defAutoPrefArgs = {
    browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"]
};

const defMinCssArgs = {
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
};

// @warning do not change .html files (use htm) !! recursive updates !!
export const html = () => src( paths.src.html, { allowEmpty: true })
	.pipe(rigger())
	.pipe(replace("@min", production ? ".min" : ''))
	.pipe(rename({
		extname: ".html"
	}))
	.pipe(dest(dist))
	.pipe(debug({
		"title": "HTML files"
	}))
	.on("end", browsersync.reload);

export const php = () => src( paths.src.php, { allowEmpty: true })
	.pipe(dest(dist))
	.pipe(debug({
		"title": "PHP files"
	}));

export const styles = () => src(paths.src.styles, { allowEmpty: true })
	.pipe(plumber())
	// .pipe(gulpif(!production, sourcemaps.init()))
	.pipe(sass())
	.pipe(groupmediaqueries())
	.pipe(gulpif(production, autoprefixer(defAutoPrefArgs)))
	.pipe(gulpif(!production, browsersync.stream()))
	.pipe(gulpif(production, mincss(defMinCssArgs)))
	.pipe(gulpif(production, rename({ suffix: ".min" })))
	.pipe(plumber.stop())
	// .pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
	.pipe(dest(paths.build.styles))
	.pipe(debug({
		"title": "CSS files"
	}))
	.on("end", () => production || '' == domain ? browsersync.reload : null);

export const stylesAssets = () => src([dir + assets + '*.scss', '!' + dir + assets + '_*.scss'], { allowEmpty: true })
	.pipe(plumber())
	// .pipe(gulpif(!production, sourcemaps.init()))
	.pipe(sass())
	// .pipe(groupmediaqueries())
	.pipe(gulpif(production, autoprefixer(defAutoPrefArgs)))
    .pipe(gulpif(production, mincss(defMinCssArgs)))
	.pipe(gulpif(production, rename({
		suffix: ".min"
	})))
	.pipe(plumber.stop())
	// .pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
	.pipe(dest(dist + assets))
	.pipe(debug({
		"title": "CSS files"
	}))
	.on("end", () => browsersync.reload);

export const scripts = () => src(paths.src.scripts, { allowEmpty: true })
	.pipe(plumber())
	.pipe(rigger())
	.pipe(gulpif(!production, sourcemaps.init()))
	.pipe(gulpif(production, uglify()))
	.pipe(gulpif(production, rename({
		suffix: ".min"
	})))
	.pipe(gulpif(!production, sourcemaps.write("./maps/")))
	.pipe(dest(paths.build.scripts))
	.pipe(debug({
		"title": "JS files"
	}))
	.on("end", browsersync.reload);

export const images = () => src(paths.src.images, { allowEmpty: true })
	.pipe(newer(paths.build.images))
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
	.pipe(dest(paths.build.images))
	.pipe(debug({
		"title": "Images"
	}))
	.on("end", browsersync.reload);

export const favs = () => src(paths.src.favicons, { allowEmpty: true })
    .pipe(newer(paths.build.favicons))
    .pipe(favicons({
        icons: {
            appleIcon: true,
            favicons: true,
            online: false,
            appleStartup: false,
            android: false,
            firefox: false,
            yandex: false,
            windows: false,
            coast: false
        }
    }))
    .pipe(dest(paths.build.favicons))
    .pipe(debug({
        "title": "Favicons"
    }));

export const moveAssets = (e) => {
	paths.assets.forEach(function(item, i, arr) {
		src(item.src, { allowEmpty: true })
            .pipe(newer(item.dest))
			.pipe(dest(item.dest))
			.pipe(debug({
				"title": "Assets"
			}));
	});

	return e();
};

export const server = () => {
	if( '' !== domain ) {
		serverCfg.proxy = domain;
	}
	else {
		serverCfg.server = {baseDir: dist};
	}

	browsersync.init(serverCfg);
};

export const watchCode = () => {
	watch(paths.watch.html,    html);
	watch(paths.watch.styles,  styles);
	watch(paths.watch.scripts, scripts);
	watch(paths.watch.images,  images);

    // if(additionalWatch) additionalWatch();
};

export const source = parallel(html, php);

/**
 * Move assets
 */
export const install = series(moveAssets);

/**
 * Build and stop
 */
export const build = series(stylesAssets, parallel(source, styles, scripts, favs, images));

/**
 * Build and continue with watcher
 */
export const run = series(build, parallel(watchCode, server));

export default run;
