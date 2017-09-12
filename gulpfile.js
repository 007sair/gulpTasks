/**
 * 前端自动化
 * created by lc
 */

var gulp = require('gulp');
var path = require('path');
var os = require('os');
var webpack = require('webpack');
var requireDir = require('require-dir');
var args = require('yargs').argv;

require('shelljs/global');

//所有gulp-插件集成到$对象上
var $ = require('gulp-load-plugins')({
    lazy: true
});

var config = require('./gulp/gulp.config.js');

var taskList = require('fs').readdirSync('./gulp/tasks/');
taskList.forEach(function (file) {
    // config -- gulp.config.js
    // $ -- gulp-load-plugins
    // args --- yargs
    require('./gulp/tasks/' + file)(gulp, config, $, args);
});

//列举所有的任务名
gulp.task('help', $.taskListing);