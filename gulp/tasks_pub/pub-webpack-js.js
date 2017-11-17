/**
 * 公共压缩、混淆、抽取js任务
 */

var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var ROOT = path.resolve(process.cwd(), './');

module.exports = function (gulp, config, $, args) {

    return function (projectName, obj) {

        let dllTaskName = "build-dll-js:" + projectName;
        let taskName = "build-js:" + projectName;

        //获取多页面的每个入口文件，用于配置中的entry
        var srcDir = path.resolve(process.cwd(), 'resources/project/' + projectName);
        function getEntry() {
            var jsPath = path.resolve(srcDir, 'js');
            var dirs = fs.readdirSync(jsPath);
            var matchs = [], files = {};
            dirs.forEach(function (item) {
                matchs = item.match(/(.+)\.js$/);
                if (matchs) {
                    files[matchs[1]] = path.resolve(srcDir, 'js', item);
                }
            });
            return files;
        }

        //引用webpack对公共库进行dll打包，生成vendor.js
        gulp.task(dllTaskName, function (callback) {
            webpack({
                entry: {
                    vendor: obj.vendor,
                },
                output: {
                    path: path.join(process.cwd(), "dist/"+ projectName +"/js/"),
                    filename: '[name].js',
                    library: '[name]_library'
                },
                plugins: [
                    new webpack.DllPlugin({
                        path: path.join(process.cwd(), "dist/"+ projectName +"/js/vendor.manifest.json"),
                        name: '[name]_library',
                        context: __dirname
                    })
                ]
            }).run(function (err, stats) {
                if (err) throw new $.util.PluginError("webpack:build-dll-js", err);
                if (args.debug) {
                    $.util.log("[webpack:build-dll-js]", stats.toString({
                        colors: true
                    }));
                }
                callback();
            });
        });


        //引用webpack对js进行合并压缩提取，并生成html页面到dist下
        gulp.task(taskName, [dllTaskName], function (callback) {
            webpack({
                cache: true,
                devtool: args.debug ? "source-map" : '',
                entry: getEntry(),
                output: {
                    path: path.join(process.cwd(), "dist/" + projectName),
                    publicPath: "",
                    filename: args.debug ? 'js/[name].js' : 'js/[name].js?v=[chunkhash:10]',
                    chunkFilename: "js/[name].js"
                },
                plugins: [
                    new CommonsChunkPlugin({
                        name: 'common',
                        minChunks: 2
                    }),
                    new uglifyJsPlugin({
                        compress: {
                            warnings: false
                        }
                    }),
                    new webpack.DllReferencePlugin({
                        context: __dirname,
                        manifest: require(path.join(process.cwd(), "dist/"+ projectName +"/js/vendor.manifest.json")),
                    })
                ],
                resolve: {
                    extensions: ['', '.js', '.json', '.scss'],
                    alias: {
                        Lib : ROOT + '/resources/lib/',
                        Plugin : ROOT + '/resources/plugin/',
                        Mod: ROOT + '/resources/project/'+ projectName +'/js/mod',
                    }
                }
            }).run(function (err, stats) {
                if (err) throw new $.util.PluginError("webpack:build-js", err);
                if (args.debug) {
                    $.util.log("[webpack:build-js]", stats.toString({
                        colors: true
                    }));
                }
                callback();
            });
        });

        return taskName
    }

};