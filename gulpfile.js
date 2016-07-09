var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var connect = require('gulp-connect');
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

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
    var bundler = browserify({
        debug: true,
        entries: config.paths.entryPoint
    });

    return bundler
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.paths.build))
        .on('error', function (e) {
            gutil.log(e);
        });
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