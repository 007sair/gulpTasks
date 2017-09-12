/**
 * 公共sass转css任务
 */

module.exports = function (gulp, config, $, args) {

    return function (projectName, obj) {

        if (!projectName) {
            console.log('请添加项目名称!');
            return false;
        }

        if (!obj.src || !obj.dest) {
            console.log(projectName, '路径错误!');
            return false;
        }

        gulp.task('sass:' + projectName, function () {
            return gulp.src(obj.src)
                .pipe($.sourcemaps.init())
                .pipe($.sass({
                    includePaths: ['./resources/'], //让sass中import的路径包含定义的字段
                    precision: 4 //保留小数点后几位 #https://github.com/sass/node-sass#precision
                })
                .on('error', $.sass.logError))
                .pipe($.postcss(config.css.postCss))
                .pipe($.cleanCss(config.css.cleanCss))
                .pipe($.sourcemaps.write('.'))
                .pipe(gulp.dest(obj.dest))
                .pipe($.connect.reload())
        });

    }

};