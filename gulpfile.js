var del          = require('del'),
gulp             = require('gulp'),
gulpFn           = require('gulp-fn'),
less             = require('gulp-less'),
print            = require('gulp-print'),
jshint           = require('gulp-jshint'),
concat           = require('gulp-concat'),
gulpFilter       = require('gulp-filter'),
uglify           = require('gulp-uglify'),
inject           = require('gulp-inject'),
plumber          = require('gulp-plumber'),
addsrc           = require('gulp-add-src'),
runSequence      = require('run-sequence'),
imagemin         = require('gulp-imagemin'),
minifyCss        = require('gulp-minify-css'),
sourcemaps       = require('gulp-sourcemaps'),
bowerMain        = require('main-bower-files'),
minifyHTML       = require('gulp-minify-html'),
spritesmith      = require('gulp.spritesmith'),
browserSync      = require('browser-sync').create(),
angularTranslate = require('gulp-angular-translate');







var path = {
    app       : './app',
    dist      : './dist',
    index     : 'app/index.html',
    resources : './app/resources',
    distImg   : './dist/app/resources/dist',
    sequences : './app/resources/img/sequences/*',
}


var sources = {
    clean: [
        path.dist,
        './index.html',
        path.app + '/resources/dist/**',
        path.app + '/style/style.css',
    ],
    js: [
        path.app + '/js/shared/**/*.js',
        path.app + '/js/components/**/*.config.js',
        path.app + '/js/components/**/*.js',
        path.app + '/js/app.js',
    ],
    less: [
        'bower_components/lesshat/build/lesshat.less',
        'bower_components/remixings/remixins.less',
        path.app + '/style/less/conf/reset.less',
        path.app + '/style/less/conf/font.less',
        path.app + '/style/less/{conf,partials}/**.less',
        path.app + '/js/**/*.less',
    ]
}




/*===============================
=            GENERIC            =
===============================*/




 gulp.task('jshint', function () {
     return gulp.src( sources.js )
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('jshint-stylish'));
 });




gulp.task('clean', function () {
    return del(sources.clean).then( () => {
        for (var i = 0; i < sources.clean.length; i++) {
            console.info('Deleted :' , sources.clean[i]);
        };
    });
});



gulp.task('translate', function() {
  return gulp.src( path.app + '/locales/locale-*.json')
    .pipe(angularTranslate({
        filename: 'translation.locales.js',
        module: 'ileotech.translate.locales',
    }))
    .pipe(gulp.dest( path.app + '/js/components/translation/' ));
});



gulp.task('sprite:sequence', () => {

    return gulp.src( path.sequences )
        .pipe(plumber())
        .pipe(print())
        .pipe(gulpFn( theFile => {
            var sequenceNameRegexp  = /([a-zA-Z-_]+)$/g,
            theSequencePath         = theFile.history[0].replace( theFile.cwd + '/' , ''),
            sequenceName            = sequenceNameRegexp.exec( theFile.history[0] )[0];

            return gulp.src( theSequencePath  + '/*.png' )
                .pipe(plumber())
                .pipe(spritesmith({
                    algorithm: 'left-right',
                    imgName: sequenceName + '-sequence.png',
                    cssName: 'not-used.css',
                })).img.pipe( gulp.dest( path.app + '/resources/dist' ));
    }));
});


/*=====  End of GENERIC  ======*/










/*=============================
=            WATCH            =
=============================*/






var BSReload = () => {browserSync.reload();}

gulp.task('watch:js', [ 'translate' , 'serve:inject', 'jshint' ], BSReload);
gulp.task('watch:html', ['serve:inject'], BSReload);
gulp.task('watch:image', ['sprite:sequence'], BSReload);
gulp.task('watch:sequences', ['serve:imagemin'], BSReload);
gulp.task('watch:less', () => {
    return gulp.src( sources.less )
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('style.less'))
        .pipe(less())
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest( path.app + '/style/' ))
        .pipe(browserSync.stream());
});





/*=====  End of WATCH  ======*/






// gulp.task('sprite', function () {
//     var spriteData = gulp.src( path.resources + '/img/sequences/gear/*.png' )
//         .pipe(plumber())
//         .pipe(spritesmith({
//             algorithm: 'left-right',
//             imgName: 'gear.png',
//             cssName: 'gear.css',
//         })).img.pipe( gulp.dest(path.dist ));
// });







/**
 *
 * SERVE
 *
 */


gulp.task('serve:inject' , function () {

    var jsSources = [
        path.app + '/js/shared/**/*.js',
        path.app + '/js/app.js',
        path.app + '/js/{directives,services,filters}/**/*.js',
        path.app + '/js/components/**/*.config.js',
        path.app + '/js/components/**/*.js',
        path.app + '/style/*.css',
    ];

    var target = gulp.src( path.index ),
        source = gulp.src( jsSources , { read: false })
    .pipe(addsrc.prepend(bowerMain()))

    return target.pipe(inject( source ))
    .pipe(gulp.dest( './' ));
});



gulp.task('serve:imagemin', () => {
    return gulp.src([
        path.app + '/resources/img/**/*.{png,jpg,jpeg,gif}',
        '!' + path.app + '/resources/img/sequences/**'
        ])
        .pipe(imagemin({
            optimizationLevel: 1
        }))
        .pipe(gulp.dest(path.app + '/resources/dist' ));
});





gulp.task('serve:less', () => {
    return gulp.src( sources.less )
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('style.less'))
        .pipe(less())
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest( path.app + '/style/' ));
});




gulp.task('serve:browse' , () => {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
})




gulp.task('serve:watch' , () => {
    gulp.watch( path.app + '/js/**/*.js', ['watch:js']);
    gulp.watch( path.app + '/**/*.html', ['watch:html']);
    gulp.watch( path.app + '/{style,js}/**/*.less', ['watch:less']);
    gulp.watch( path.app + '/resources/img/sequences/**', ['watch:sequences']);
    gulp.watch( path.app + '/resources/img/*.{png,jpeg,jpg,gif}', ['watch:image']);
})




gulp.task('serve', ['clean'] , callback => {
    runSequence(
        [
            'jshint',
            'translate',
            'serve:less',
            'sprite:sequence',
        ],
        [
            'serve:inject',
            'serve:imagemin',
        ],
        'serve:browse',
        'serve:watch',
    callback);
});







/*=============================
=            BUILD            =
=============================*/



 gulp.task('dist:vendors' , function () {

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




gulp.task('dist:less', () => {
    return gulp.src( sources.less )
        .pipe(plumber())
        .pipe(concat('style.less'))
        .pipe(less())
        .pipe(minifyCss())
        .pipe(gulp.dest( path.dist ));
});




gulp.task('dist:font', () => {
    return gulp.src( path.resources + '/fonts/**', { base: './' })
        .pipe(plumber())
        .pipe(gulp.dest( path.dist ));
})


gulp.task('dist:templates', () => {
    return gulp.src( path.app + '/**/*.template.html', { base: './' })
        .pipe(plumber())
        .pipe(minifyHTML({
            conditionals: true,
            spare:true
        }))
        .pipe(gulp.dest( path.dist ));
})



gulp.task('dist:imagemin', () => {
    return gulp.src([
            path.app + '/resources/img/**/*.{png,jpg,jpeg,gif}',
            '!' + path.app + '/resources/img/sequences/**'
        ])
        .pipe(imagemin({
            optimizationLevel: 5
        }))
        .pipe(gulp.dest(path.dist + '/app/resources/dist' ));
});


gulp.task('dist:js' , () => {
    return gulp.src( sources.js )
        .pipe(plumber())
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(gulp.dest( path.dist ));
})


gulp.task('dist:inject' , () => {
    var sourcesInjected = gulp.src([
        path.dist + '/vendor*.{css,js}',
        path.dist + '/*.{css,js}',
    ], { read: false });

    return gulp.src( path.index )
        .pipe(inject( sourcesInjected , {
            transform: filepath => {
                filepath = filepath.replace('/dist/', './');
                if(filepath.indexOf('.css') >= 0){
                    return '<link rel="stylesheet" href="' + filepath + '">';
                }
                return '<script src="' + filepath + '"></script>';
            }
        }))
        .pipe(minifyHTML({
            conditionals: true,
            spare:true
        }))
        .pipe(gulp.dest( path.dist ));
})


gulp.task('dist:browse' , () => {
    browserSync.init({
        server: {
            baseDir: path.dist
        }
    });
})




gulp.task('build', ['clean'] , callback => {
    runSequence(
        [
            'dist:js',
            'translate',
            'dist:less',
            'dist:font',
            'dist:vendors',
            'dist:templates',
            'sprite:sequence',
        ],
        [
            'dist:imagemin',
            'dist:inject',
        ],
        'dist:browse',
    callback);
});





/*=====  End of BUILD  ======*/