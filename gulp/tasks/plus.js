/**
 * 项目信息
 * -------------------
 * @名称  Plus
 * @版本  v1.0
 * @日期  2017-03-05 至 2017-09-08
 * @作者  龙潺 longchan@mia.com
 * @描述  生成css与js
 * @备注  备注信息
 * @日志
 *    - [2017/10/11] do something by longchan
 *    - [2017/10/13] do something2 by xxx
 */

/**
 * 项目名称
 * ！必须与项目目录（resources/project/{projectName}）相同
 */
var projectName = 'plus';

//项目路径
var oPath = {
    src: {
        css: 'resources/project/' + projectName + '/css/*.scss',
        js: 'resources/project/' + projectName + '/js/*.js',
        img: 'resources/project/' + projectName + '/sprites/*.png'
    },
    dist: {
        css: 'dist/'+ projectName +'/css/',
        js: '',
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

    var pub_sprite_svg = require('../tasks_pub/pub-sprite-svg.js')(gulp, config, $, args);
    pub_sprite_svg();


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