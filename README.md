# 重构reset

## 目录结构

``` ruby
.
├─ gulp                 #gulp相关配置
│  ├─ gulp.config.js    #gulp插件共用配置
│  ├─ tasks             #多任务，一个js文件对应多个任务
│  └─ tasks_pub         #公共任务，多处使用
└─ resources            #源文件目录
   ├─ base              #sass库目录
   ├─ lib               #js库目录
   ├─ plugin            #js插件目录
   ├─ project           #项目目录
   │  ├─ groupon        #举例：项目1
   │  │  ├─ css         #项目1的css目录，存放sass文件
   │  │  ├─ js          #项目1的js文件，目录下的直接js文件为入口文件，可以创建mod目录，用来存放模块文件
   │  │  └─ sprites     #项目1的雪碧图目录，存放单个icon
   │  └─ plus           #举例：项目2
   └─ svg               #公共svg目录，存放所有单个svg图标
```

## 背景

当一个目录下的项目过于繁杂时，我们不可能把所有的任务（task）都写入一个`gulpfile.js`内。

需要有一个合理的_目录结构_与_思想_来管理项目与任务之间的_关联_问题。

**思路如下：**

- **目录结构：** 项目目录独立，任务文件独立；
- **思想：** 启动特定gulp命令，其他项目不受干扰；
- **关联：** 项目目录名称与任务名称保持一致。

## 开发流程

1. 在`resources/project/`下创建一个项目目录
2. 在`gulp/tasks/`下创建一个`xxx.js`文件
3. 修改`xxx.js`内容，如`projectName`

## 举例

- 开发`groupon`项目时，启动`gulp groupon`，任务都写在`gulp/tasks/groupon.js`内；
- 开发`plus`项目时，启动`gulp plus`，任务都写在`gulp/tasks/plus.js`内。

## 保持一致

项目目录名称（`resources/project/xxx`）= 任务文件名称（`gulp/tasks/xxx.js`） = 任务文件内的变量名（`var projectName = 'xxx';`）

其中，`xxx`需一致。

## 维护

在重构之前，我们对于项目的管理没有一个明确的文档或者注释来进行说明，这样后期维护都是致命的。

有了本地重构，我们可以在任务文件的顶部按照规范写入我们关于开发的所有信息：

``` js
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
```

任务文件在重构后与项目紧密关联，任何项目在开发前我们都可以查看其对于的任务来获取开发信息。