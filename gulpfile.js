var del = require('del'),
    vp = require('vinyl-paths'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    templateCache = require('gulp-angular-templatecache'),
    htmlmin = require('gulp-htmlmin'),
    less = require('gulp-less'),
    cssmin = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace');

// clean _tmp/_dist
gulp.task('clean', function() {
  return gulp.src([
    '_tmp/',
    '_dist/'
  ])
  .pipe(vp(del));
});

// combine templates to single Angular module
gulp.task('templates', ['clean'], function() {
  return gulp.src('src/views/**/*.html')
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }))
      .pipe(templateCache({
        root: 'views/'
      }))
      .pipe(replace('angular.module("templates")', 'app'))
      .pipe(gulp.dest('_tmp/js/'));
});

// htmlmin index
gulp.task('htmlmin-index', ['clean'], function() {
  return gulp.src('src/index.release.html')
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }))
      .pipe(rename('index.html'))
      .pipe(gulp.dest('_tmp/'));
});

// less to css, css concat and min
gulp.task('less-css', ['clean'], function() {
  return gulp.src([
        'bower_components/normalize-css/normalize.css',
        'bower_components/highlightjs/styles/monokai.css',
        'src/css/markdown.css',
        'src/css/main.less'
      ])
      .pipe(less())
      .pipe(concat('main.css'))
      .pipe(cssmin())
      .pipe(gulp.dest('_tmp/css/'));
});

// copy articles
gulp.task('copy-articles', ['clean'], function(){
  return gulp.src('src/articles/**/*.*')
    .pipe(gulp.dest('_dist/articles/'));
});

// copy favicon
gulp.task('copy-favicon', ['clean'], function(){
  return gulp.src('src/favicon.ico')
    .pipe(gulp.dest('_dist/'));
});

// concat all js file
gulp.task('concat', ['templates'], function() {
  return gulp.src([
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/markdown-it/dist/markdown-it.js',
        'bower_components/highlightjs/highlight.pack.js',
        'src/js/app.js',
        '_tmp/js/templates.js',
        'src/js/services/**/*.js',
        'src/js/controllers/**/*.js'
      ])
      .pipe(concat('main.js'))
      .pipe(replace('', ''))
      .pipe(uglify())
      .pipe(gulp.dest('_tmp/js/'));
});

gulp.task('revision', [
  'htmlmin-index',
  'less-css',
  'copy-articles',
  'copy-favicon',
  'concat'
], function() {
  return gulp.src([
        '_tmp/js/main.js',
        '_tmp/css/main.css'
      ])
      .pipe(rev())
      .pipe(gulp.dest('_dist/assets'))
      .pipe(rev.manifest())
      .pipe(gulp.dest('_tmp/'));
});

gulp.task('rev-replace', ['revision'], function() {
  return gulp.src('_tmp/index.html')
      .pipe(revReplace({
        manifest: gulp.src('_tmp/rev-manifest.json')
      }))
      .pipe(gulp.dest('_dist/'))
});

// task release
gulp.task('release', [
  'rev-replace'
]);

// task default
gulp.task('default', [
  'release'
]);
