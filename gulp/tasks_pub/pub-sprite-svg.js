/**
 * svg公共任务
 */

module.exports = function (gulp, config, $, args) {

    return function () {

        let taskName = 'sprite-svg';

        //合并resources/svg/下的图标到dist/下，并生成对应的svg.html预览页
        gulp.task(taskName, function () {
            return gulp.src('resources/svg/*.svg')
                .pipe($.svgmin())
                .pipe($.svgSprites({
                    mode: "symbols",
                    common: 'icon-svg',
                    svgId: "svg-%f",
                    preview: {
                        symbols: 'svg.html'
                    },
                    svg: {
                        symbols: 'icon-svg.svg'
                    }
                }))
                .pipe(gulp.dest('dist/'));
        });

        return taskName
    }

};