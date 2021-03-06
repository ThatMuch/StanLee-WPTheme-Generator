/*
 * GULP CONFIG
 *
 * Desciption:  Clean gulpfile for web development workflow containing
 *              - compiling/optimization of sass, javascript and images from assets to dist and vendors
 *              - browsersync
 *              - cache-busting
 *              - modernizr
 *              - vendor handling through glulp-vendors.json
 *
 * Usage:       - `gulp` (to run the whole process)
 *              - `gulp watch` (to watch for changes and compile if anything is being modified)
 *              - `modernizr -c assets/scripts/modernizr-config.json -d assets/scripts` to generate the modernizr.js file from the config-file
 *              - add vendor-requirements to gulp-vendors.json, they will be compiled/bundled by `gulp` (restart `gulp watch`)
 *
 * Author:      <%= author %> (<%= author_email %>)
 *
 * Version:     2.3.1
 *
*/


/* SETTINGS
/===================================================== */
// local domain used by browsersync
var browsersync_proxy = "<%= proxy_address %>";

// default asset paths
var assets = {
  css       : ['assets/styles/style.scss'],
  css_watch : ['assets/styles/**/*.scss'],
  admin_css: ['assets/AdminStyles/admin.scss'],
  admin_css_watch: ['assets/AdminStyles/**/*.scss'],
  login_css: ['assets/AdminStyles/login.scss'],
  javascript: ['assets/scripts/*.js'],
  images    : ['assets/images/*.*'],
  fonts     : ['assets/fonts/*.*']
}

var build_files = [
  '**',
  '!node_modules',
  '!node_modules/**',
  '!bower_components',
  '!bower_components/**',
  '!dist',
  '!dist/**',
  '!sass',
  '!sass/**',
  '!.git',
  '!.git/**',
  '!package.json',
  '!.gitignore',
  '!gulpfile.js',
  '!.editorconfig',
  '!.jshintrc'
];

// vendors are loaded from gulp-vendors.json
var vendors = require('./gulp-vendors.json');


/* DEPENDENCIES
/===================================================== */
// general
var gulp        = require('gulp');
var concat      = require('gulp-concat');
var rename      = require("gulp-rename");
var order       = require("gulp-order");
var browserSync = require('browser-sync').create();
// css
var sass         = require('gulp-sass');
var cleanCSS     = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
// cache busting
var rev = require('gulp-rev');
// js
var uglify = require('gulp-uglify');
// traduction
var wpPot = require('gulp-wp-pot');
// error handling with notify & plumber
var notify  = require("gulp-notify");
var plumber = require('gulp-plumber');
// watch
var watch = require('gulp-watch');
// delete
var del = require('del');
// zip
var zip = require('gulp-zip');


/* TASKS
/===================================================== */

/* CLEAN
/––––––––––––––––––––––––*/
// delete compiled files/folders (before running the build)
// css
gulp.task('clean:css', function() { return del(['dist/*.css', 'dist/rev-manifest.json'])});
gulp.task('clean:cachebust', function() { return del(['./style-*.min.css'])});
gulp.task('clean:javascript', function() { return del(['dist/*.js'])});

/* BROWSERSYNC
/––––––––––––––––––––––––*/
// initialize Browser Sync
gulp.task('browsersync', function() {
  browserSync.init({
    proxy: browsersync_proxy,
    notify: true,
    open: false,
    snippetOptions: {
      whitelist: ['/wp-admin/admin-ajax.php'],
      blacklist: ['/wp-admin/**']
    },
    reloadDelay: 800
  });
});


/* CSS
/––––––––––––––––––––––––*/
// from:    assets/styles/main.css
// actions: compile, minify, prefix, rename
// to:      ./style.min.css
gulp.task('css', gulp.series('clean:css', function() {
  return gulp
    .src(assets['css'].concat(vendors['css']))
    .pipe(plumber({errorHandler: notify.onError("Error")}))
    .pipe(concat('style.min.css'))
    .pipe(sass())
    .pipe(autoprefixer('last 2 version', { cascade: false }))
    .pipe(cleanCSS())
    .pipe(rename('./style.min.css'))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());
}));

/* ADMIN CSS
/––––––––––––––––––––––––*/
// from:    assets/styles/main.css
// actions: compile, minify, prefix, rename
// to:      ./style.min.css
gulp.task('admin_css',gulp.series('clean:admin_css',function () {
  return gulp
    .src(assets['admin_css'])
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(concat('admin_style.min.css'))
    .pipe(sass())
    .pipe(autoprefixer('last 2 version',{ cascade: false }))
    .pipe(cleanCSS())
    .pipe(rename('./admin_style.min.css'))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());
}));

/* LOGIN CSS
/––––––––––––––––––––––––*/
// from:    assets/styles/main.css
// actions: compile, minify, prefix, rename
// to:      ./style.min.css
gulp.task('login_css',gulp.series('clean:admin_css',function () {
  return gulp
    .src(assets['login_css'])
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(concat('login_style.min.css'))
    .pipe(sass())
    .pipe(autoprefixer('last 2 version',{ cascade: false }))
    .pipe(cleanCSS())
    .pipe(rename('./login_style.min.css'))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());
}));


/* CSS CACHE BUSTING
/––––––––––––––––––––––––*/
// from:    dist/style.min.css
// actions: create busted version of file
// to:      dist/style-[hash].min.css
gulp.task('cachebust', gulp.series('clean:cachebust', 'css', function() {
  return gulp
    .src('./style.min.css')
    .pipe(rev())
    .pipe(gulp.dest('./'))
    .pipe(rev.manifest({merge: true}))
    .pipe(gulp.dest('./'))
}));


/* JAVASCRIPT
/––––––––––––––––––––––––*/
// from:    assets/scripts/
// actions: concatinate, minify, rename
// to:      ./script.min.css
// note:    modernizr.js is concatinated first in .pipe(order)
gulp.task('javascript', gulp.series('clean:javascript', function() {
  return gulp
    .src(assets['javascript'].concat(vendors['javascript']))
    .pipe(order([
      'assets/scripts/modernizr.js',
      'assets/scripts/*.js'
    ], { base: './' }))
    .pipe(plumber({errorHandler: notify.onError("Error")}))
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(rename('./script.min.js'))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());
}));

/* LANGUAGES
/––––––––––––––––––––––––*/
// from:    ./
// actions: Generates pot files for WordPress plugins and themes.
// to:      ./languages
gulp.task('makepot', function () {
  return gulp
    .src(['**/*.php'])
    .pipe(wpPot({
      domain: '<%= theme_domain %>',
      destFile: '<%= theme_domain %>.pot',
      package: '<%= package_name %>',
      bugReport: '<%= theme_bugreport %>',
      team: '<%= author %> <<%= author_email %>>'
    }))
    .pipe(gulp.dest('languages/<%= theme_domain %>.pot'))
    .pipe(browserSync.reload({stream:true}));
});


/* WATCH
/––––––––––––––––––––––––*/
// watch for modifications in
// styles, scripts, images, php files, html files
gulp.task('watch',gulp.parallel('browsersync',function () {
  watch(assets['css_watch'],gulp.series('css','cachebust'));
  watch(assets['admin_css_watch'],gulp.series('admin_css','login_css'));
  watch(assets['javascript'],gulp.series('javascript'));
  watch('**/*.php',browserSync.reload);
  watch('*.html',browserSync.reload);
  watch('**/*.scss',browserSync.reload);
}));

gulp.task('build-clean', function() {
  return del(['dist/**/*']);
});

gulp.task('build-copy', function() {
  return gulp
    .src(build_files)
    .pipe(gulp.dest('dist/'));
});

gulp.task('build-zip', function() {
  return gulp
    .src('dist/**/*')
    .pipe(zip('<%= theme_domain %>.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-delete', function() {
  return del(['dist/**/*', '!dist/<%= theme_domain %>.zip']);
});


/* DEFAULT
/––––––––––––––––––––––––*/
// default gulp tasks executed with `gulp`
gulp.task('default',gulp.series('css','admin_css', 'login_css','cachebust', 'javascript','makepot'));

gulp.task('build',
  gulp.series('default','build-clean','build-copy','build-zip','build-delete')
);
