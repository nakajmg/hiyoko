'use strict';

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const process = require("child_process");
const exec = process.exec;
const sass = require("gulp-sass");
const econ = require("electron-connect").server.create();

const src = {
  sass: "src/sass/**/*.scss",
  js: ["./app.js"]
};

const dist = {
  sass: "./dist"
};

gulp.task("sass", () => {
  return gulp.src(src.sass)
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(sass())
    .pipe(gulp.dest(dist.sass));
});

gulp.task("serve", () => {
  econ.start();
  gulp.watch(["./main.js"], econ.restart);
  gulp.watch([src.sass], ["sass", econ.reload]);
  gulp.watch(["./index.html", src.js], econ.reload);
});
