var del     = require('del'),
gulp        = require('gulp'),
less        = require('gulp-less'),
concat      = require('gulp-concat'),
gulpFilter  = require('gulp-filter'),
uglify      = require('gulp-uglify'),
inject      = require('gulp-inject'),
plumber     = require('gulp-plumber'),
addsrc      = require('gulp-add-src'),
sourcemaps  = require('gulp-sourcemaps'),
minifyCss   = require('gulp-minify-css'),
jshint      = require('gulp-jshint'),
// minifyHTML  = require('gulp-minify-html'),
bowerMain   = require('main-bower-files'),
browserSync = require('browser-sync').create();




var path = {
    app   : './app',
    dist  : './dist',
    index : 'app/index.html',
}



gulp.task('clean', function () {

    var cleanablePaths = [
        path.dist,
        './index.html',
        path.app + '/style/style.css',
    ];

    del(cleanablePaths).then( paths => {
        for (var i = 0; i < paths.length; i++) {
            console.info(warn('Deleted:'), paths[i]);
        };
    });
});





var BSReload = () => {browserSync.reload();}

gulp.task('watch:js', ['inject:dev' , 'jshint'], browserSync.reload);
gulp.task('watch:less', ['inject:dev'], BSReload);
gulp.task('watch:php', ['php:build'], BSReload);




gulp.task('less', function () {
    var lessFilePaths = [
        '/bower_components/remixings/remixins.less',
        path.app + '/style/less/{conf,partials}/**.less',
    ];

    return gulp.src(lessFilePaths)
        .pipe(plumber())
        .pipe(concat('style.less'))
        .pipe(less())
        .pipe(sourcemaps.init())
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest( path.app + '/style/' ));
});




 gulp.task('vendors' , function () {

     var jsFilter = gulpFilter('*.js', {restore: true}),
     cssFilter    = gulpFilter('*.css', {restore: true});

     return gulp.src(bowerMain())
        .pipe(plumber())
        .pipe( jsFilter )
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist))
        .pipe( jsFilter.restore)
        .pipe(cssFilter)
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(path.dist))
 });







gulp.task('js:dist' , ['vendors'] ,  function () {

    return gulp.src([
        path.app + '/js/app.js',
        path.app + '/js/{directives,services,components,filters}/**/*.js',
    ])
    .pipe(concat('script.js'))
    .pipe(uglify())
    .pipe(gulp.dest(path.dist))
});




gulp.task('jshint', function () {
    gulp.src([
        path.app + '/js/app.js',
        path.app + '/js/{directives,services,components,filters}/**/*.js',
    ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});



gulp.task('inject:dist', ['js:dist'] , function () {

    var target = gulp.src( path.index ),
        source = gulp.src([
            path.dist + '/vendor*',
            path.dist + '/**',
        ], { read: false });

    return target.pipe(inject( source , {
        transform: filepath => {
            filepath = filepath.replace('/dist/', './');
            if(filepath.indexOf('.css') >= 0){
                return '<link rel="stylesheet" href="' + filepath + '">';
            }
            return '<script src="' + filepath + '"></script>';
        }
    }))
    .pipe(gulp.dest( path.dist ));
});




gulp.task('inject:dev', [ 'less' ] , function () {

    var target = gulp.src( path.index ),
        source = gulp.src([
        path.app + '/js/app.js',
        path.app + '/js/{directives,services,components,filters}/**/*.js',
        path.app + '/style/style.css',
    ], { read: false })
    .pipe(addsrc.prepend(bowerMain()))

    return target.pipe(inject( source ))
    .pipe(gulp.dest( './' ));
});





gulp.task('build' , [ 'clean' , 'inject:dist' ] , () => {

    browserSync.init({
        server: {
            baseDir: path.dist
        }
    });
})


gulp.task('serve' , [ 'inject:dev' ] , () => {

    browserSync.init({
        server: {
            baseDir: './'
        }
    });


    gulp.watch( path.app + '/js/**/*.js', ['watch:js']);
    gulp.watch( path.app + '/{style,js}/**/*.less', ['watch:less']);
});





