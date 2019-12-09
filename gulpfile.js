// dirs
var dir = {
  assets: "assets/",
  templates: "./",
  src: "src/",
  build: "dist/"
};

// modules
var gulp = require("gulp");
var newer = require("gulp-newer");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var cssnano = require('cssnano');
var mqpacker = require('css-mqpacker');
var gradients = require('postcss-easing-gradients');
var autoprefixer = require("autoprefixer");
var concat = require("gulp-concat");
var babel = require("gulp-babel");
var terser = require("gulp-terser");
var browserSync = require("browser-sync").create();

// tasks
gulp.task("img", function() {
  var out = dir.assets + "img/" + dir.build;
  return gulp.src(dir.assets + "img/" + dir.src + "**/*")
    .pipe(newer(out))
    .pipe(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.jpegtran({progressive: true}),
		imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: false},
				{cleanupIDs: false}
			]
		})
	]))
    .pipe(gulp.dest(out));
});

gulp.task("css", function() {
  var postCssOpts = [
    autoprefixer,
    cssnano,
    gradients
  ];

  return gulp.src(dir.assets + "css/" + dir.src + "**/*.scss")
    .pipe(sass({
      outputStyle: "nested",
      imagePath: dir.assets + "img/" + dir.src,
      precision: 3,
      errLogToConsole: true
    }))
    .pipe(postcss(postCssOpts))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dir.assets + "css/" + dir.build))
});

gulp.task("js", function() {
  return gulp.src(dir.assets + "js/" + dir.src + "**/*")
    .pipe(concat("scripts.min.js"))
    .pipe(babel())
    .pipe(terser())
    .pipe(gulp.dest(dir.assets + "js/" + dir.build));
});

gulp.task("browserSync", function() {
  browserSync.init({
    open: false,
    https: true,
    host: "fabiobarbosa.test",
    proxy: "https://fabiobarbosa.test"
  })
});

// run, build, watch
gulp.task("build", gulp.series("img", "css", "js"));

gulp.task("watch", gulp.parallel("browserSync", function watchFiles() {
  gulp.watch(dir.assets + "img/" + dir.src + "**/*").on('change', gulp.series("img", browserSync.reload));
  gulp.watch(dir.assets + "css/" + dir.src + "**/*.scss").on('change', gulp.series("css", browserSync.reload));
  gulp.watch(dir.assets + "js/" + dir.src + "**/*.js").on('change', gulp.series("js", browserSync.reload));
  gulp.watch(dir.templates + "**/*.php").on('change', browserSync.reload);
}));

gulp.task("default", gulp.series("build", "watch"));
