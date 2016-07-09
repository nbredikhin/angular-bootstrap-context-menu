var gulp = require('gulp');
var gutil = require('gulp-util');
var connect = require('gulp-connect');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var mainBowerFiles = require('main-bower-files');

var config = {
    paths: {
        entryPoint: './app/js/app.js',
        js: './app/js/**/*.js',
        less: './app/less/**/*.less',
        html: './app/**/*.html',
        build: './public'
    }
};

gulp.task('connect', function () {
    connect.server({
        root: config.paths.build,
        port: 8000
    });
});

gulp.task('build-scripts', function () {
    return gulp.src(mainBowerFiles().concat([config.paths.js]))
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.paths.build));
});

gulp.task('build-less', function () {
	return gulp.src(config.paths.less)
		.pipe(less())
		.pipe(gulp.dest(config.paths.build));
});

gulp.task('build-html', function () {
    return gulp.src(config.paths.html)
        .pipe(gulp.dest(config.paths.build));
});

gulp.task('watch', ['default', 'connect'], function () {
    gulp.watch([config.paths.html], ['build-html']);
    gulp.watch([config.paths.js], ['build-scripts']);
    gulp.watch([config.paths.less], ['build-less']);
});

gulp.task('default', ['build-less', 'build-scripts', 'build-html']);