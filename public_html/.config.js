"use strict";

module.exports = {
    /** {String} Path to the source directory. Target is root + src + ${*.*} */
    src: '',
    /** {String} Path to the destination directory. Target is root + dest + ${*.*} */
    dest: '',

    scssExt: '*.scss',
    jsExt:   '*.js',
    imgExt:  '*.{jpg,jpeg,png,gif,svg}',
}

var paths = module.exports.paths = {
    assets: 'assets/',
    module: 'assets/module/',

    html: false, // index.raw.html
    pug: 'index.pug',

    styles: {
        src:  'assets/scss/',
        dest: 'assets/',
    },

    images: {
        src:  'img/HD/',
        dest: 'img/',
    },

    blocks: {
        src: 'assets/pages/',
        dest: 'pages/',
    },

    vendor: {
        src:  'assets/vendor/_source/',
        dest: 'assets/vendor/',
    },

    webpack: {
        // how can i compile page's scripts?
        src:  ['assets/babel/*.js', 'assets/vendor/_source/*.js'],
        dest: 'assets/',
        config: {
            entry: {
                main: './public_html/assets/babel/main',
                bootstrap: './public_html/assets/vendor/_source/bootstrap'
            },
            output: {
                filename: "[name].js",
            },
            module: {
                rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules)/,
                    loader: 'babel-loader',
                    query: {
                        presets: ["@babel/preset-env"],
                    },
                },
                ],
            },
        },
    },
};

var vendor = module.exports.vendor = [
    {
        name: 'Jquery',
        src: './node_modules/jquery/dist/**/*',
        dest: paths.vendor.dest + 'jquery/'
    },
    {
        name: 'Cleave',
        src: './node_modules/cleave.js/dist/**/*',
        dest: paths.vendor.dest + 'cleave/'
    },
    {
        name: 'Slick',
        src: './node_modules/slick-carousel/slick/**/*',
        dest: paths.vendor.dest + 'slick/',
    },
    {
        name: 'Fancybox',
        src: './node_modules/@fancyapps/fancybox/dist/**/*',
        dest: paths.vendor.dest + 'fancybox/'
    },
    {
        name: 'Waypoints',
        src: './node_modules/waypoints/lib/**/*',
        dest: paths.vendor.dest + 'waypoints/'
    },
];
