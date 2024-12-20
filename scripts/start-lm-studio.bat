@echo off
echo Starting LM Studio...
cd ..\LM-Studio-copy
start "" "LM Studio.exe"
echo Waiting for LM Studio to initialize...
timeout /t 10 /nobreak
echo LM Studio should now be running!