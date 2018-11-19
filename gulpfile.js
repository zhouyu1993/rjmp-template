const path = require('path')

const gulp = require('gulp')

const plumber = require('gulp-plumber')
const rename = require('gulp-rename')

const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

const eslint = require('gulp-eslint')

const imagemin = require('gulp-imagemin')

const compileJS = require('./compile.js')

const srcDir = path.resolve('./src')
const buildDir = path.resolve('./dist')

const prod = process.env.NODE_ENV === 'production'

gulp.task('scss', () => {
  if (prod) {
    return gulp.src([srcDir + '/**/*.scss', '!' + srcDir + '/assets/scss/*.scss'])
      .pipe(plumber())
      .pipe(sass())
      .pipe(postcss([ autoprefixer() ]))
      .pipe(rename(path => {
        path.extname = '.wxss'
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest(buildDir))
  } else {
    return gulp.src([srcDir + '/**/*.scss', '!' + srcDir + '/assets/scss/*.scss'])
      .pipe(plumber())
      .pipe(sass())
      .pipe(rename(path => {
        path.extname = '.wxss'
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest(buildDir))
  }
})

gulp.task('js', () => {
  return gulp.src([srcDir + '/**/*.js'])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(compileJS({
      prod,
      srcDir: 'src',
      distDir: 'dist'
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest(buildDir))
})

gulp.task('json', () => {
  return gulp.src([srcDir + '/**/*.json'])
    .pipe(gulp.dest(buildDir))
})

gulp.task('wxml', () => {
  return gulp.src([srcDir + '/**/*.wxml'])
    .pipe(gulp.dest(buildDir))
})

gulp.task('wxss', () => {
  return gulp.src([srcDir + '/**/*.wxss'])
    .pipe(gulp.dest(buildDir))
})

gulp.task('wxs', () => {
  return gulp.src([srcDir + '/**/*.wxs'])
    .pipe(gulp.dest(buildDir))
})

gulp.task('img', () => {
  return gulp.src([srcDir + '/assets/img/**/**'])
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(plumber.stop())
    .pipe(gulp.dest(buildDir + '/assets/img'))
})

gulp.task('assets', () => {
  return gulp.src([srcDir + '/assets/**/**.**', '!' + srcDir + '/assets/img/**/**', '!' + srcDir + '/assets/scss/**/**'])
    .pipe(gulp.dest(buildDir + '/assets'))
})

gulp.task('watch', () => {
  gulp.watch(srcDir + '/**/*.scss', ['scss'])
  gulp.watch(srcDir + '/**/*.js', ['js'])
  gulp.watch(srcDir + '/**/*.json', ['json'])
  gulp.watch(srcDir + '/**/*.wxml', ['wxml'])
  gulp.watch(srcDir + '/**/*.wxss', ['wxss'])
  gulp.watch(srcDir + '/**/*.wxs', ['wxs'])
  gulp.watch(srcDir + '/assets/**/**.**', ['img', 'assets'])
})

gulp.task('default', ['scss', 'js', 'json', 'wxml', 'wxss', 'wxs', 'img', 'assets', 'watch'])
