"use strict";

/** @type {String} For use proxy */
global.domain = '';

global.serverCfg = {
	port: 9000,
	/** @type {Boolean} Need proxy for multiple devices */
	tunnel: false,
	notify: false
}

/** @global {String} Path to the root directory */
global.dir   = './source/';
global.dist = './public_html/';

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

global.assets = 'assets/';
global.scss   = 'styles/';
global.js     = 'assets/';
global.img    = 'img/';

require(dir + "config");

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

export const assetsDists = (e) => {
	paths.assets.forEach(function(item, i, arr) {
		src(item.src, { allowEmpty: true })
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

export const common = parallel(source, styles, scripts, images);

/**
 * Move assets, build and stop
 */
export const build = series(assetsDists, stylesAssets, common);

/**
 * Build and continue with watcher
 */
export const run = series(stylesAssets, common, parallel(watchCode, server));

export default run;
