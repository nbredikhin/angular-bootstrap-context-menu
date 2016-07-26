const gulp = require('gulp');
const util = require('gulp-util');
const less = require('gulp-less');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const sourcemaps = require('gulp-sourcemaps');
const mainBowerFiles = require('main-bower-files');

const paths = {
    dist: 'dist/',
    less: 'assets/less/**/*.less',
    js: 'app/**/*.js',
    html: 'app/**/*.html'
};

gulp.task('connect', function () {
    // Validate --port argument
    var port = parseInt(util.env.port);
    if (isNaN(port) || port <= 0 || port >= 65536) {
        port = 8000;
    }
    connect.server({
        root: paths.dist,
        port: port
    });
});

gulp.task('bower', function () {
    return gulp.src(mainBowerFiles(), {
        base: 'bower_components'
    })
        .pipe(gulp.dest('dist/lib'));
});

gulp.task('less', function () {
    return gulp.src(paths.less)
        .pipe(less())
        .pipe(concat('app.css'))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']  
        }))
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(gulp.dest(paths.dist));    
});

gulp.task('default', ['bower', 'less', 'js', 'html']);

gulp.task('watch', ['default', 'connect'], function () {
    gulp.watch([paths.html], ['html']);
    gulp.watch([paths.js], ['js']);
    gulp.watch([paths.less], ['less']);
});
