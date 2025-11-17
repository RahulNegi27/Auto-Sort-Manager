@echo off
REM AutoSort Application Setup Script (Windows)
REM This script automates the complete setup process

setlocal enabledelayedexpansion

echo.
echo 🚀 AutoSort Setup Script
echo ========================
echo.

REM Colors not available in batch, using simple text
set "CHECK_MARK=[OK]"
set "X_MARK=[FAIL]"

REM Step 1: Check prerequisites
echo [1/5] Checking prerequisites...

where node >nul 2>nul
if errorlevel 1 (
    echo %X_MARK% Node.js is not installed
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo %X_MARK% npm is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %CHECK_MARK% Node.js %NODE_VERSION% found

REM Step 2: Install root dependencies
echo.
echo [2/5] Installing root dependencies...

if not exist "package.json" (
    echo %X_MARK% package.json not found
    exit /b 1
)

call npm install --legacy-peer-deps
if errorlevel 1 (
    echo %X_MARK% Failed to install root dependencies
    exit /b 1
)
echo %CHECK_MARK% Root dependencies installed

REM Step 3: Install renderer dependencies
echo.
echo [3/5] Installing renderer dependencies...

if not exist "renderer\package.json" (
    echo %X_MARK% renderer/package.json not found
    exit /b 1
)

cd renderer
call npm install --legacy-peer-deps
if errorlevel 1 (
    cd ..
    echo %X_MARK% Failed to install renderer dependencies
    exit /b 1
)
cd ..
echo %CHECK_MARK% Renderer dependencies installed

REM Step 4: Create environment files
echo.
echo [4/5] Setting up environment files...

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo %CHECK_MARK% .env created from template
    ) else (
        echo WARNING .env.example not found
    )
) else (
    echo WARNING .env already exists
)

REM Step 5: Verify installation
echo.
echo [5/5] Verifying installation...

set "FILES_OK=1"

if not exist "package.json" (
    echo %X_MARK% Missing: package.json
    set "FILES_OK=0"
)
if not exist "renderer\package.json" (
    echo %X_MARK% Missing: renderer/package.json
    set "FILES_OK=0"
)
if not exist "electron-main\main.ts" (
    echo %X_MARK% Missing: electron-main/main.ts
    set "FILES_OK=0"
)
if not exist "renderer\src\main.tsx" (
    echo %X_MARK% Missing: renderer/src/main.tsx
    set "FILES_OK=0"
)
if not exist "shared\types.ts" (
    echo %X_MARK% Missing: shared/types.ts
    set "FILES_OK=0"
)
if not exist "db\database.ts" (
    echo %X_MARK% Missing: db/database.ts
    set "FILES_OK=0"
)

if "!FILES_OK!"=="1" (
    echo %CHECK_MARK% All required files present
) else (
    echo %X_MARK% Some required files are missing
    exit /b 1
)

echo.
echo ===================================================
echo %CHECK_MARK% Setup completed successfully!
echo ===================================================
echo.
echo Next steps:
echo   1. npm run dev           (Start development server)
echo   2. npm run build         (Build for production)
echo   3. npm run dist          (Create installer)
echo.
echo Documentation:
echo   - README.md              (Full documentation)
echo   - QUICKSTART.md          (Quick setup guide)
echo   - PROJECT_STRUCTURE.md   (File structure overview)
echo.
pause
