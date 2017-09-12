/**
 * 项目信息
 * -------------------
 * @名称  拼团
 * @版本  v5.6
 * @日期  2017-03-05 至 2017-09-08
 * @作者  龙潺 longchan@mia.com
 * @描述  生成css与js
 * @更新：
 *    @日期：
 *    @修改人：
 * @备注：
 */

/**
 * 项目名称
 * ！必须与项目目录（resources/project/{projectName}）相同
 */
var projectName = 'groupon';

//项目路径
var oPath = {
    src: {
        css: 'resources/project/' + projectName + '/css/*.scss',
        js: 'resources/project/' + projectName + '/js/*.js',
        img: 'resources/project/' + projectName + '/sprites/*.png'
    },
    dist: {
        css: 'dist/'+ projectName +'/css/',
        img: 'dist/'+ projectName +'/img/'
    }
};


module.exports = function (gulp, config, $, args) {

    //sass
    var pub_sass = require('../tasks_pub/pub-sass.js')(gulp, config, $, args);
    pub_sass(projectName, {
        src: oPath.src.css,
        dest: oPath.dist.css
    });

    //png雪碧图
    var pub_sprite_img = require('../tasks_pub/pub-sprite-img.js')(gulp, config, $, args);
    pub_sprite_img(projectName, {
        src: oPath.src.img,
        dest: {
            img: oPath.dist.img,
            css: 'resources/project/' + projectName + '/css'
        },
        config: {
            cssName: '_sprites.scss',
            cssFormat: 'scss',
            imgName: 'icon-sprite.png',
            imgPath: oPath.dist.img + 'icon-sprite.png',
            padding: 20
        }
    });

    //svg合并
    var pub_sprite_svg = require('../tasks_pub/pub-sprite-svg.js')(gulp, config, $, args);
    pub_sprite_svg();


    //合并、压缩、抽取js
    var webpack_js = require('../tasks_pub/pub-webpack-js.js')(gulp, config, $, args);
    webpack_js(projectName, {
        vendor: [
            './resources/lib/zepto.js'
        ]
    });


    //监听
    gulp.task('watch:' + projectName, function (done) {
        if (args.watch) {
            gulp.watch(oPath.src.css, ['sass:' + projectName]);
            gulp.watch(oPath.src.img, ['spriteImage:' + projectName]);
            gulp.watch('resources/svg/*.svg', ['sprite:svg']);
            gulp.watch(oPath.src.js, ['build-js:' + projectName]);
        }
        done()
    });


    gulp.task(projectName, function (cb) {
        $.sequence(
            'spriteImage:'+projectName, 
            ['build-js:' + projectName, 
            'sass:'+projectName, 
            'sprite:svg'], 
            'watch:' + projectName, 
            cb
        );
    });

};