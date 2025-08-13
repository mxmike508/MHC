@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo === Bob PDF -> Markdown Extractor ===

REM Resolve paths
set "ROOT=%~dp0"
set "TOOLS=%ROOT%tools"
set "DOCS_PDF=%ROOT%docs\pdf"
set "DOCS_MD=%ROOT%docs\md"
set "VENV_DIR=%ROOT%.venv"
set "VENV_PY=%VENV_DIR%\Scripts\python.exe"

REM Ensure folders
if not exist "%DOCS_PDF%" mkdir "%DOCS_PDF%"
if not exist "%DOCS_MD%" mkdir "%DOCS_MD%"
if not exist "%TOOLS%" mkdir "%TOOLS%"

REM Ensure extractor exists
if not exist "%TOOLS%\extract_pdfs.py" (
  echo ERROR: Missing tools\extract_pdfs.py
  echo Please keep the extractor at tools\extract_pdfs.py
  pause
  exit /b 1
)

REM Find Python
set "PY_CMD="
where py >nul 2>&1 && set "PY_CMD=py -3"
if not defined PY_CMD (
  where python >nul 2>&1 && set "PY_CMD=python"
)
if not defined PY_CMD (
  echo Python is not installed. Opening the download page...
  start "" "https://www.python.org/downloads/windows/"
  echo After installing Python, run this script again.
  pause
  exit /b 1
)

REM Create venv if needed
if not exist "%VENV_PY%" (
  echo Creating virtual environment...
  %PY_CMD% -m venv "%VENV_DIR%"
  if errorlevel 1 (
    echo Failed to create virtual environment.
    pause
    exit /b 1
  )
)

REM Install deps
echo Installing dependencies (pdfplumber)...
"%VENV_PY%" -m pip install --upgrade pip >nul
"%VENV_PY%" -m pip install --disable-pip-version-check pdfplumber >nul
if errorlevel 1 (
  echo Failed to install dependencies. Check your internet connection and try again.
  pause
  exit /b 1
)

REM Check for PDFs
set "FOUND="
for /r "%DOCS_PDF%" %%f in (*.pdf) do (
  set "FOUND=1"
  goto :runextract
)

echo No PDFs found in "%DOCS_PDF%".
echo Put your PDFs into this folder, then run this again.
start "" "%DOCS_PDF%"
pause
exit /b 0

:runextract
echo Extracting from:
echo   %DOCS_PDF%
echo Output to:
echo   %DOCS_MD%

"%VENV_PY%" "%TOOLS%\extract_pdfs.py" "%DOCS_PDF%" "%DOCS_MD%"
if errorlevel 1 (
  echo Extraction encountered an error.
  pause
  exit /b 1
)

echo Done. Opening output folder...
start "" "%DOCS_MD%"
echo Tip: If you saw "No extractable text" warnings, the PDF may be scanned (needs OCR). Re-run after OCR.
pause
exit /b 0