@cd %~dp0
@E:\Program\jre\bin\java.exe -jar ./yuicompressor-2.4.6.jar --line-break 1000 -o ../src/hosteditor.cssmin ../src/hosteditor.css
@echo Compress Css success
@E:\Program\jre\bin\java.exe -jar ./yuicompressor-2.4.6.jar --line-break 1000 -o ".js$:.jsmin" ../src/*.js
@echo Compress Js success
@E:\Program\jre\bin\java.exe -jar ./rhino1.7R3.jar -opt 3 ./merge.js -c=./profile.js
@del /q "../src/*.cssmin"
@echo Clear tmp Css success
@del /q "../src/*.jsmin"
@echo Clear tmp Js success
@pause