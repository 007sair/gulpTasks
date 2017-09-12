/**
 * 公共png雪碧图任务
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

        //合并src/sprites目录下的png到dist/images下，并生成_sprites.scss到src/css下
        gulp.task('spriteImage:' + projectName, function (done) {
            var spriteData = gulp.src(obj.src)
                .pipe($.spritesmith(obj.config));
            spriteData.img.pipe($.imagemin()).pipe(gulp.dest(obj.dest.img));
            spriteData.css.pipe(gulp.dest(obj.dest.css));
            done()
        });
    }

};