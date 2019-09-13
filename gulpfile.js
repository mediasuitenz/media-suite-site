const gulp = require('gulp')
const concat = require('gulp-concat')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const cleanCSS = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const processhtml = require('gulp-processhtml')
const del = require('del')
const rsync = require('gulp-rsync')
const chmod = require('gulp-chmod')
const request = require('request')
const log = require('fancy-log')

const dir = {
  src: 'src/',
  dist: 'dist/'
}

const clean = () => del([dir.dist])
clean.description = 'clean dist directory before regenerating files'

// Minify CSS, add vendor prefixes, save to /dist/css folder
const styles = () => {
  return gulp.src('./src/_site/css/*.css', { base: dir.src })
    .pipe(concat('style.css'))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('./dist/css'))
}

// Combine, minify, rename and save plugin scripts to /dist/js folder
const scriptsPlugins = () => {
  return gulp.src('./src/_site/js/concat/*.js', { base: dir.src })
    .pipe(concat('.js'))
    .pipe(uglify())
    .pipe(rename('plugins.min.js'))
    .pipe(gulp.dest('./dist/js'))
}

// Minify main js file and save to /dist/js folder
const minifyMainjs = () => {
  return gulp.src('./src/_site/js/main.js')
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('./dist/js'))
}

// Minify scripts that need to stay separate and save to /dist/js folder
const scriptsOther = gulp.series(minifyMainjs, () =>
  gulp.src([
    './src/_site/js/*.js',
    '!./src/_site/js/main.js'
  ])
    .pipe(gulp.dest('./dist/js'))
)

// Combine and minify scripts, save to /dist/js folder
const scripts = gulp.series(scriptsPlugins, scriptsOther)

// Process html pages (inserting correct asset links) and move to dist
const html = () => {
  return gulp.src([
    './src/_site/**/*.html'
  ], { base: './src/_site' })
    .pipe(processhtml())
    .pipe(gulp.dest('./dist'))
}

const moveImages = () => {
  return gulp.src('./src/_site/img/**/*.*')
    .pipe(chmod(0o644))
    .pipe(gulp.dest('./dist/img'))
}

const moveFavicon = () => {
  return gulp.src([
    './src/_site/*.{png,svg,ico,webmanifest}',
    './src/_site/browserconfig.xml'
  ], { base: './src/_site' })
    .pipe(gulp.dest('./dist'))
}

const moveFonts = () => {
  return gulp.src('./src/_site/fonts/**/*.*')
    .pipe(gulp.dest('./dist/fonts'))
}

const moveAssets = gulp.parallel(moveImages, moveFavicon, moveFonts)
moveAssets.description = 'move other assets to dist'

const rsyncDist = () => {
  return gulp.src('dist/**')
    .pipe(rsync({
      root: 'dist/',
      hostname: 'mediasuite.co.nz',
      destination: 'htdocs/',
      archive: true,
      clean: true,
      recursive: true,
      exclude: ['.htaccess']
    }))
}

const cloudflarePurgeCache = (cb) => {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const authEmail = process.env.CLOUDFLARE_AUTH_EMAIL
  const authKey = process.env.CLOUDFLARE_AUTH_KEY

  if (!zoneId || !authEmail || !authKey) return log.error('Missing Cloudflare environment variables')

  const options = {
    url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    headers: {
      'X-Auth-Email': authEmail,
      'X-Auth-Key': authKey
    },
    json: {
      purge_everything: true
    }
  }
  request.delete(options, function (err, res, body) {
    if (err) {
      log.error(err.message)
    }
    if (res.statusCode !== 200 || res.body.result === 'error') {
      let errorMessage = 'Not able to purge cache.'
      if (res.body && res.body.msg) {
        errorMessage = res.body.msg
      }
      log.error(errorMessage)
    }
  })
  cb()
}

const deploy = gulp.series(rsyncDist, cloudflarePurgeCache)

// Default task - run 'gulp' to generate all site files ready for deploy
const defaultTasks = gulp.series(clean, gulp.parallel(styles, scripts, html, moveAssets))

exports.clean = clean
exports.deploy = deploy
exports.default = defaultTasks
