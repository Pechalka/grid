var gulp       = require('gulp'),

    browserify = require('gulp-browserify'),
    concat     = require('gulp-concat'),
    imagemin   = require('gulp-imagemin');

//var imagemin = require('gulp-imagemin');

var pngquant = require('imagemin-pngquant');

gulp.task('styles', function () {
        gulp.src([
            'assets/css/reset.css',
            'assets/css/mobile.css', 
            'assets/css/app.css',
            'assets/css/animation.css'
        ])
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('./build/'));

});

gulp.task('scripts', function () {

    gulp.src(['assets/js/app.js'])
        .pipe(browserify({
            debug: true,
            transform: [ 'reactify' ]
        }))
        .pipe(gulp.dest('build/'));

});

// gulp.task('images', function () {

//     gulp.src(['assets/img/*'])
//         .pipe(imagemin())
//         .pipe(gulp.dest('./build/img/'));

// });


gulp.task('images', function () {
    return gulp.src('assets/img/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/img/'));
});

gulp.task('dev', function () {

    gulp.run('build');

    gulp.watch('assets/js/**/*.js', [ 'scripts' ]);
    gulp.watch('assets/css/**/*.css', [ 'styles' ]);
  //  gulp.watch('assets/img/**/*', [ 'images' ]);

});

gulp.task('build', ['styles', 'scripts' ]);

