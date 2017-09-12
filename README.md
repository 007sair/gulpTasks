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
   │  └─ plus           #举例：项目2
   └─ svg               #svg相关文件
```

## 背景

`miyababy`目录下项目繁多，在一个`gulpfile.js`内建多任务的情况已经无法满足现有需求。

## 目的

一个任务对应一个task文件，达到分离`gulpfile.js`的目的。