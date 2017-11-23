const gulp = require('gulp')
const concat = require('gulp-concat')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const cleanCSS = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const processhtml = require('gulp-processhtml')
const del = require('del')
const rsync = require('gulp-rsync')

// Default task - run 'gulp' to generate all site files ready for deploy
gulp.task('default', ['clean'], function () {
  gulp.start('styles', 'scripts', 'html', 'move-assets')
})

// Clean dist directory before regenerating files
gulp.task('clean', function () {
  return del('./dist/**/*')
})

// Minify CSS, add vendor prefixes, save to /dist/css folder
gulp.task('styles', function () {
  return gulp.src('./src/_site/css/*.css', { base: './src' })
    .pipe(concat('style.css'))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(cleanCSS())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('./dist/css'))
})

// Combine and minify scripts, save to /dist/js folder
gulp.task('scripts', ['scripts-plugins', 'scripts-other'])

// Combine, minify, rename and save plugin scripts to /dist/js folder
gulp.task('scripts-plugins', function () {
  return gulp.src('./src/_site/js/concat/*.js', { base: './src' })
    .pipe(concat('.js'))
    .pipe(uglify())
    .pipe(rename('plugins.min.js'))
    .pipe(gulp.dest('./dist/js'))
})

// Minify scripts that need to stay separate and save to /dist/js folder
gulp.task('scripts-other', ['minify-mainjs'], function () {
  return gulp.src([
    './src/_site/js/*.js',
    '!./src/_site/js/main.js'
  ])
  .pipe(gulp.dest('./dist/js'))
})

// Minify main js file and save to /dist/js folder
gulp.task('minify-mainjs', function () {
  return gulp.src('./src/_site/js/main.js')
  .pipe(uglify())
  .pipe(rename('main.min.js'))
  .pipe(gulp.dest('./dist/js'))
})

// Process html pages (inserting correct asset links) and move to dist
gulp.task('html', function () {
  const filesToMove = [
    './src/_site/index.html',
    './src/_site/favicon.ico',
    './src/_site/404/index.html',
    './src/_site/case-studies/**/*.*',
    './src/_site/our-services/**/*.*',
    './src/_site/people/**/*.*',
    './src/_site/say-hello/**/*.*',
    './src/_site/terms/**/*.*',
    './src/_site/culture/**/*.*'
  ]
  return gulp.src(filesToMove, { base: './src/_site' })
  .pipe(processhtml())
  .pipe(gulp.dest('./dist'))
})

// Move other assets to dist
gulp.task('move-assets', ['move-images', 'move-fonts'])

gulp.task('move-images', function () {
  return gulp.src('./src/_site/img/**/*.*')
  .pipe(gulp.dest('./dist/img'))
})

gulp.task('move-fonts', function () {
  return gulp.src('./src/_site/fonts/**/*.*')
  .pipe(gulp.dest('./dist/fonts'))
})

gulp.task('deploy', function () {
  return gulp.src('dist/**')
    .pipe(rsync({
      root: 'dist/',
      hostname: 'media-suite-site',
      destination: 'htdocs/',
      archive: true,
      clean: true,
      recursive: true,
      exclude: ['.htaccess', 'cash4code']
    }))
})
