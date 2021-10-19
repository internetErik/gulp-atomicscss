const { src, dest, watch, series } = require('gulp');
const atomic = require('./index');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));

exports.atomic = function(cb) {
  src('./test/html/**/*.html')
  .pipe(concat('_atomic.scss'))
  .pipe(atomic())
  .pipe(dest('./test/scss/'))
  cb();
}

exports.sass = function(cb) {
  src('./test/scss/*.scss')
  .pipe(sass())
  .pipe(dest('./test/css/'))
  cb();
}

exports.default = series(atomic, sass);
