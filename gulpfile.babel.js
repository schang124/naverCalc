'use strict';

import gulp from 'gulp';
import del from 'del';
import webpack from 'webpack-stream';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Lint JavaScript
gulp.task('lint', () =>
gulp.src(['app/scripts/**/*.js','!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
);

// Optimize images
gulp.task('images', () =>
gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}))
);

// Copy all files at the root level (app)
gulp.task('copy', () =>
gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
], {
    dot: true
}).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
    const AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ];

// For best performance, don't add Sass partials to `gulp.src`
return gulp.src([
    'app/styles/**/*.scss',
    // 'app/styles/**/*.css'
])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.compass({
        css: 'app/styles/scss',
        sass: 'app/styles/scss'
    }))
    // .pipe($.sass({
    //     precision: 10
    // }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(gulp.dest('.tmp/styles'));
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts', () =>
gulp.src([
    // Note: Since we are not using useref in the scripts build pipeline,
    //       you need to explicitly list your scripts here in the right order
    //       to be correctly concatenated
    './app/scripts/index.js'
    // Other scripts
])
    .pipe(webpack({
        output: {
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env']
                        }
                    }
                }
            ]
        },
        devtool: '#inline-source-map'
    }))
    // .pipe($.newer('.tmp/scripts'))
    // .pipe($.sourcemaps.init())
    // .pipe($.browserify({
    //     insertGlobals : true,
    //     debug : !gulp.env.production
    // }))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.uglify())
    .pipe($.rename('main.min.js'))
    // Output files
    .pipe($.size({title: 'scripts'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(gulp.dest('.tmp/scripts'))
);

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
    return gulp.src('app/**/*.html')
        .pipe($.useref({
            searchPath: '{.tmp,app}',
            noAssets: true
        }))

        // Minify any HTML
        .pipe($.if('*.html', $.htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true
        })))
        // Output files
        .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
        .pipe(gulp.dest('dist'));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Watch files for changes & reload
gulp.task('serve', ['scripts', 'styles'], () => {
    browserSync({
                    notify: false,
                    // Customize the Browsersync console logging prefix
                    logPrefix: 'WSK',
                    // Allow scroll syncing across breakpoints
                    scrollElementMapping: ['main', '.mdl-layout'],
                    // Run as an https by uncommenting 'https: true'
                    // Note: this uses an unsigned certificate which on first access
                    //       will present a certificate warning in the browser.
                    // https: true,
                    server: ['.tmp', 'app'],
                    port: 3000,
                    ghostMode: false
                });

gulp.watch(['app/**/*.html'], reload);
gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', reload]);
gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 3001
})
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
    runSequence(
        'styles',
        ['lint', 'html', 'scripts', 'images', 'copy'],
        cb
    )
);