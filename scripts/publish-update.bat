@echo off
setlocal
set "message=%*"
if "%message%"=="" set "message=Update application"

git add .
git diff --cached --quiet
if %errorlevel%==0 (
  echo No changes to commit.
  exit /b 0
)

git commit -m "%message%"
if errorlevel 1 exit /b 1
git push
