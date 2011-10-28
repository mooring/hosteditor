@cd %~dp0
@D:\Program\jre\bin\java.exe -jar ./yuicompressor-2.4.6.jar --line-break 1000 -o ../src/hosteditor.cssmin ../src/hosteditor.css
@echo "compress Css success"
@D:\Program\jre\bin\java.exe -jar ./yuicompressor-2.4.6.jar --line-break 1000 -o ".js$:.jsmin" ../src/*.js
@echo "compress Js success"
@D:\Program\jre\bin\java.exe -jar ./rhino1.7R3.jar -opt 3 ./merge.js -c=./profile.js
@del /q "../src/*.cssmin"
@echo "clear tmp Css success"
@del /q "../src/*.jsmin"
@echo "clear tmp  Js success"
@pause