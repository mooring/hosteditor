@cd %~dp0
@D:\Program\jre\bin\java.exe -jar ./rhino1.7R3.jar -opt 9 ./merge.js -c=./profile.cfg
@D:\Program\jre\bin\java.exe -jar ./yuicompressor-2.4.6.jar -o ../dest/meixx.min.js ../dest/meixx.js
pause
