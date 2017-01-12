'use strict';

var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');


gulp.task('dist', function() {
    return gulp.src('src/*.js')
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(concat('incrementer-min.js'))
        .pipe(gulp.dest('dist'));
});
