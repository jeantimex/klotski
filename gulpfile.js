var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var pump = require('pump');
var banner = require('gulp-banner');
var pkg = require('./package.json');

var comment =
  '/*\n' +
  ' * <%= pkg.name %> <%= pkg.version %>\n' +
  ' * <%= pkg.description %>\n' +
  ' * <%= pkg.homepage %>\n' +
  ' *\n' +
  ' * Copyright 2017, <%= pkg.author %>\n' +
  ' * Released under the <%= pkg.license %> license.\n' +
  '*/\n\n';

gulp.task('default', function(cb) {
  pump(
    [
      gulp.src('src/klotski.js'),
      uglify(),
      banner(comment, { pkg: pkg }),
      rename({ suffix: '.min' }),
      gulp.dest('dist'),
    ],
    cb
  );
});
