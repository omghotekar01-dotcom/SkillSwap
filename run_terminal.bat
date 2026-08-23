@echo off
cd /d "%~dp0c-programs"
set C_COMPILER=

rem If not already running in a new CMD, re-launch this script in a new cmd window
if /I "%~1" NEQ "run" (
    start "Skillswap Terminal" cmd /k "%~f0 run"
    exit /b 0
)
rem use a random suffix to avoid file lock collisions
set BUILD_EXE=skillswap_terminal_build_%RANDOM%.exe
where gcc >nul 2>&1
if not errorlevel 1 set C_COMPILER=gcc
if not defined C_COMPILER (
    where clang >nul 2>&1
    if not errorlevel 1 set C_COMPILER=clang
)
if not defined C_COMPILER (
    where cl >nul 2>&1
    if not errorlevel 1 set C_COMPILER=cl
)

if not defined C_COMPILER goto no_compiler

echo Using %C_COMPILER% to compile skillswap_terminal.c
if /I "%C_COMPILER%" == "cl" goto compile_cl

goto compile_gcc

:compile_gcc
%C_COMPILER% skillswap_terminal.c -o %BUILD_EXE%
if errorlevel 1 (
    echo Compilation failed with %C_COMPILER%.
    pause
    exit /b 1
)

goto run_exe

:compile_cl
cl /nologo /EHsc /Fe:%BUILD_EXE% skillswap_terminal.c
if errorlevel 1 (
    echo Compilation failed with cl.exe.
    pause
    exit /b 1
)

goto run_exe

:run_exe
echo Running %BUILD_EXE%...
%BUILD_EXE%

goto :eof

:no_compiler
echo No supported C compiler found in PATH.
echo Install MinGW-w64 (gcc) or Visual Studio Build Tools (cl.exe), then reopen your terminal.
pause
exit /b 1
