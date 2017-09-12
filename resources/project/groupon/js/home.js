/**
 * rem脚本js
 * ----------------
 * 根据 /src/css/_config.scss 中的变量 $output 的值引入对应js
 *   $output: 640    ->   ./lib/rem640.js
 *   $output: 750    ->   ./lib/rem750.js
 */

/*
 * TODO:
 * 1 数据本地化 √
 * 2 修改loading在tab内的逻辑 √
 * 3 tab切换导致页面高度问题，触发了页面滚动加载数据 √
 * 4 tab悬浮后，切换tab数据不足时，页面会跳的问题 √
 * 5 一次加载数据过少，页面高度不足，反复加载功能 √
 */

//lib
var rem = require('Lib/rem750.js');
