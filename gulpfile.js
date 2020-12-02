const gulp = require("gulp");
const concat = require("gulp-concat");
var less = require("gulp-less");
const del = require("del");
const plumber = require("gulp-plumber");
const headerComment = require("gulp-header-comment");
const minify = require("gulp-minify");
const zip = require("gulp-zip");

const settings = {
    files: ["./src/addons/*.js", "./src/main.js"],
    libs: [],
    outfile: "ha-simple-card.js",
    libsfile: "",
    lessfiles: "",
    distfolder: "./dist/ha-simple-card",
    releasefolder: "./release",
    releasefile: "ha-simple-card.zip",
    hassfolder: "/Volumes/zeususdata/home/homeassistant/.homeassistant/www/community/ha-simple-card",
    rb3afolder: "/Volumes/rb3a-data/home/homeassistant/.homeassistant/www/community/ha-simple-card"
};

// Command line option:
//  --fatal=[warning|error|off]
// var fatalLevel = require('yargs').argv.fatal;
var fatalLevel = "error";

let ERROR_LEVELS = ["error", "warning"];
/**
 * Return true if the given level is equal to or more severe than
 * the configured fatality error level.
 * If the fatalLevel is 'off', then this will always return false.
 * Defaults the fatalLevel to 'error'.
 * @param {*} level
 */
function isFatal(level) {
    return ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf(fatalLevel || "error");
}

/**
 * Handle an error based on its severity level.
 * Log all levels, and exit the process for fatal levels.
 * @param {*} level
 * @param {*} error
 */
function handleError(level, error) {
    console.log(error.message);
    if (isFatal(level)) {
        process.exit(1);
    }
}

function onError(error) {
    handleError.call(this, "error", error);
}
function onWarning(error) {
    handleError.call(this, "warning", error);
}

/**
 * clean up distributen and release
 */
gulp.task("cleanup", function () {
    return del([settings.distfolder + "/*.*", settings.releasefolder + "/*.zip"]);
});

/**
 * used to deploy the files to
 * the home-assistant plugins folder
 */
gulp.task("deploy", function () {
    if (settings.hassfolder) {
        return gulp
            .src(settings.distfolder + "/*.*")
            .pipe(gulp.dest(settings.hassfolder))
            .pipe(gulp.dest(settings.rb3afolder))
            .on("error", onError);
    } else {
        return done();
    }
});

/**
 * build the release for github
 */
gulp.task("release", function () {
    return gulp
        .src([settings.distfolder + "/**/*"])
        .pipe(zip(settings.releasefile))
        .pipe(gulp.dest(settings.releasefolder))
        .on("error", onError);
});

/**
 * build the libs
 */
gulp.task("build-libs", function () {
    return gulp
        .src(settings.libs)
        .pipe(plumber())
        .pipe(concat(settings.libsfile))
        .pipe(minify())
        .pipe(gulp.dest(settings.distfolder))
        .on("error", onError);
});

gulp.task("build-css", function () {
    return gulp
        .src(settings.lessfiles)
        .pipe(less())
        .pipe(minify())
        .pipe(gulp.dest(settings.distfolder))
        .on("error", onError);
});
/**
 * build the custom card
 */
gulp.task("build", function () {
    return gulp
        .src(settings.files)
        .pipe(plumber())
        .pipe(concat(settings.outfile))
        .pipe(minify())
        .pipe(
            headerComment(`
            <%= pkg.name %> <%= pkg.version %>		
	          <%= pkg.homepage %>
	  
      		  License: <%= pkg.license %>
      		  Generated on <%= moment().format('YYYY') %>
      		  Author: <%= _.capitalize(pkg.author) %>
    		`)
        )
        .pipe(gulp.dest(settings.distfolder))
        .on("error", onError);
});

/**
 * default task
 * gulp.series(["cleanup", "build", "build-libs", "release", "deploy"], function (done) {
 */
gulp.task(
    "default",
    gulp.series(["cleanup", "build", "release", "deploy"], function (done) {
        // task code here
        done();
    })
);
