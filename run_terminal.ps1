$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\c-programs"

$compiler = $null
foreach ($candidate in @('gcc','clang','cl')) {
    if (Get-Command $candidate -ErrorAction SilentlyContinue) {
        $compiler = $candidate
        break
    }
}

if (-not $compiler) {
    Write-Host 'No supported C compiler found in PATH.' -ForegroundColor Yellow
    Write-Host 'Install MinGW-w64 (gcc) or Visual Studio Build Tools (cl.exe), then reopen your terminal.'
    exit 1
}

if ($compiler -eq 'cl') {
    cl /nologo /EHsc /Fe:skillswap_terminal.exe skillswap_terminal.c
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Compilation failed with cl.exe. Run this from a Developer Command Prompt.' -ForegroundColor Red
        exit $LASTEXITCODE
    }
} else {
    & $compiler skillswap_terminal.c -o skillswap_terminal.exe
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Compilation failed with $compiler." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Write-Host 'Running skillswap_terminal.exe...' -ForegroundColor Green
.& .\skillswap_terminal.exe
