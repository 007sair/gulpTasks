## 目录结构

``` ruby
.
├─ gulp                 #gulp相关配置
│  ├─ gulp.config.js    #gulp插件公用配置
│  ├─ tasks             #多任务目录，每个js文件都是一个独立任务
│  └─ tasks_pub         #公共任务目录，可重复使用
└─ resources            #源文件目录
   ├─ base              #sass库目录
   ├─ lib               #js库目录
   ├─ plugin            #js插件目录
   ├─ project           #项目目录
   │  ├─ groupon        #举例：项目1
   │  │  ├─ css         #项目1的css目录，存放sass文件
   │  │  ├─ js          #项目1的js文件，目录下的直接js文件为入口文件，可以创建mod目录，用来存放模块文件
   │  │  └─ sprites     #项目1的雪碧图目录，存放多个icon
   │  ├─ plus           #举例：项目2
   │  │  └─ ...         
   │  └─ ...            
   └─ svg               #公共svg目录，存放所有svg图标
```

## 功能

根据对应项目生成对应资源文件（暂不支持html）

## 背景

当一个网站下的项目过于繁杂时，我们不可能把所有的任务（task）都写入一个`gulpfile.js`内。

需要有一个合理的 *目录结构* 与 *架构思想* 来管理项目与任务之间的 *关联* 问题。

**思路如下：**

- **目录结构：** 项目源文件独立，对应任务（单js文件）独立；
- **架构思想：** 启动指定项目的gulp任务，其他项目不受干扰；
- **关联：** 项目目录名称与任务名称保持一致。

## 举例

- 开发`groupon`项目时，启动`gulp groupon`，任务都写在`gulp/tasks/groupon.js`内；
- 开发`plus`项目时，启动`gulp plus`，任务都写在`gulp/tasks/plus.js`内。

## 开发流程

1. 在`resources/project/`下创建一个项目文件夹，文件夹内建好`css/js/sprites`目录；
2. 在`gulp/tasks/`下创建一个`xxx.js`文件；
3. 修改`xxx.js`内容，如`projectName`，修改文件输出路径；
4. 启动命令`gulp 项目名称`；

## 命令参数

``` bash
#xxx 为项目名称
gulp xxx

#debug webpack任务会带有具体信息，css/js会生成.map文件
gulp xxx --debug

#保持监听状态
gulp xxx --watch
```

## 保持一致

项目目录名称（`resources/project/xxx`）

||

任务文件名称（`gulp/tasks/xxx.js`） 

||

任务文件内的变量名（`var projectName = 'xxx';`）

## 关于维护

之前，旧的项目没有一个明确的文档或注释，后期维护都是致命的。

此次重构，我们可以在任务文件的顶部按照规范写入我们关于开发的所有信息，如下：

``` js
/**
 * 项目信息
 * -------------------
 * @名称  拼团
 * @版本  v5.6
 * @日期  2017-03-05 至 2017-09-08
 * @作者  龙潺 longchan@mia.com
 * @描述  生成css与js
 * @备注  备注信息
 * @日志
 *    - [2017/10/11] do something by longchan
 *    - [2017/10/13] do something2 by xxx
 */
```

任务文件在重构后与项目紧密关联，任何项目在开发前我们都可以查看其对于的任务来获取开发信息。
