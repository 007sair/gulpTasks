@echo off
echo -------------------------------------
echo 将在此目录下进行文件替换，确认请继续
echo -------------------------------------
pause
copy /y %~dp0spritesmith\spritesheet-templates.js %~dp0node_modules\gulp.spritesmith\node_modules\spritesheet-templates\lib\spritesheet-templates.js
echo copy: %~dp0spritesmith\spritesheet-templates.js
echo to: %~dp0node_modules\gulp.spritesmith\node_modules\spritesheet-templates\lib\spritesheet-templates.js
copy /y %~dp0spritesmith\templates\scss.template.handlebars %~dp0node_modules\gulp.spritesmith\node_modules\spritesheet-templates\lib\templates\scss.template.handlebars
echo copy: %~dp0spritesmith\templates\scss.template.handlebars
echo to: %~dp0node_modules\gulp.spritesmith\node_modules\spritesheet-templates\lib\templates\scss.template.handlebars

echo 替换完成
pause