@echo off
echo -------------------------------------
echo ���ڴ�Ŀ¼�½����ļ��滻��ȷ�������
echo -------------------------------------
pause
copy /y %~dp0spritesmith\spritesheet-templates.js %~dp0node_modules\gulp.spritesmith\node_modules\spritesheet-templates\lib\spritesheet-templates.js
echo copy: %~dp0spritesmith\spritesheet-templates.js
echo to: %~dp0node_modules\gulp.spritesmith\node_modules\spritesheet-templates\lib\spritesheet-templates.js
copy /y %~dp0spritesmith\templates\scss.template.handlebars %~dp0node_modules\gulp.spritesmith\node_modules\spritesheet-templates\lib\templates\scss.template.handlebars
echo copy: %~dp0spritesmith\templates\scss.template.handlebars
echo to: %~dp0node_modules\gulp.spritesmith\node_modules\spritesheet-templates\lib\templates\scss.template.handlebars

echo �滻���
pause