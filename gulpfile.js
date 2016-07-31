const gulp = require('gulp');
const util = require('gulp-util');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const sourcemaps = require('gulp-sourcemaps');

const paths = {
    dist: 'dist/',
    js: 'src/**/*.js',
};

gulp.task('js', function () {
    var babelPipe = babel({
        presets: ['es2015']  
    });

    babelPipe.on('error', (e) => {
        util.log(util.colors.red(e.name), e.message);
        babelPipe.end();
    });

    return gulp.src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(babelPipe)
        .pipe(concat('bootstrapContextMenu.js'))
        .pipe(minify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist));
});
gulp.task('default', ['js']);

gulp.task('watch', ['default'], function () {
    gulp.watch([paths.js], ['js']);
});
