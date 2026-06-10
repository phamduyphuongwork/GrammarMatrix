@echo off
title Update GrammarMatrix to GitHub
echo Dang cap nhat code len GitHub, vui long cho trong giay lat...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update_github.ps1"
echo.
echo Da hoan thanh! Nhan phim bat ky de thoat.
pause
