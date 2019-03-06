"use strict";

/** @type {String} For use proxy */
global.domain = ''; // wordpress.cms

/** @type {Boolean} Need proxy for multiple devices */
global.tunnel = false;

/** @type {String} Path to the template directory */
global.dir = './public_html/';

import { src, dest, watch, parallel, series } from "gulp";
import gulpif from "gulp-if";
import browsersync from "browser-sync";
import autoprefixer from "gulp-autoprefixer";
import uglify from "gulp-uglify";
import sass from "gulp-sass";
import groupmediaqueries from "gulp-group-css-media-queries";
import mincss from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import newer from "gulp-newer";
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminZopfli from "imagemin-zopfli";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGiflossy from "imagemin-giflossy";
import replace from "gulp-replace";
import rigger from "gulp-rigger";
import plumber from "gulp-plumber";
import debug from "gulp-debug";
import clean from "gulp-clean";
import yargs from "yargs";

const argv = yargs.argv;

global.paths = {};

global.raw    = '';
global.assets = '';
global.scss   = '';
global.js     = '';
global.img    = '';

global.additionalTasks = [];
global.additionalWatch = function() {}

/** Path to the template configuration */
// @todo How can i use to same as import?
// import getPaths from global.dir + "config";

global.production = !!argv.production;

const { additionalAssetsTasks, additionalTasks, additionalWatch } = require(dir + "config");

// @todo fix it! (not worked)
// Do not recursive overdose
paths.watch.html.push('!*.html');

export const server = () => {
	let bsOpts = {
		port: 9000,
		tunnel: tunnel,
		notify: false
	}

	if( '' === domain ) {
		bsOpts.server = {baseDir: paths.build.general};
	}
	else {
		bsOpts.proxy = domain;
	}

	browsersync.init(bsOpts);
};

export const watchCode = () => {
	watch(paths.watch.html, html);
	watch(paths.watch.styles, styles);
	watch(paths.watch.scripts, scripts);
	watch(paths.src.images, images);

    additionalWatch();
};

// @warning do not change .html files (use htm) !! recursive updates !!
export const html = () => src(paths.src.html, { allowEmpty: true })
	.pipe(rigger())
	.pipe(gulpif(production, replace("template_styles.css", "template_styles.min.css")))
	.pipe(gulpif(production, replace("main.js", "main.min.js")))
	.pipe(rename({
		extname: ".html"
	}))
	.pipe(dest(paths.build.general))
	.pipe(debug({
		"title": "HTML files"
	}))
	.on("end", browsersync.reload);

export const styles = () => src(paths.src.styles)
	.pipe(plumber())
	.pipe(gulpif(!production, sourcemaps.init()))
	.pipe(sass())
	.pipe(groupmediaqueries())
	.pipe(gulpif(production, autoprefixer({
		browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"]
	})))
	.pipe(gulpif(!production, browsersync.stream()))
	.pipe(gulpif(production, mincss({
		compatibility: "ie8", level: {
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
		}
	})))
	.pipe(gulpif(production, rename({
		suffix: ".min"
	})))
	.pipe(plumber.stop())
	.pipe(gulpif(!production, sourcemaps.write("./assets/maps/")))
	.pipe(dest(paths.build.styles))
	.pipe(debug({
		"title": "CSS files"
	}))
	.on("end", () => production ? browsersync.reload : null);

export const scripts = () => src(paths.src.scripts)
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

export const images = () => src(paths.src.images)
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


export const common = parallel(html, styles, scripts, images);

/**
 * Move assets, build and stop
 */
export const build = series(additionalAssetsTasks, additionalTasks, common);

/**
 * Build and start server with watcher
 */
export const run = series(additionalTasks, common, parallel(watchCode, server));

export default run;
