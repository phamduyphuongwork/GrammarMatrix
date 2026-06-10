# Script to update GrammarMatrix GitHub repository with log file
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logPath = Join-Path $scriptDir "update_log.txt"
Start-Transcript -Path $logPath -Force

$repoUrl = "https://github.com/phamduyphuongwork/GrammarMatrix.git"
$tempDir = Join-Path $env:TEMP "GrammarMatrix_Temp"
$sourceDir = $scriptDir

try {
    Write-Host "1. Cleaning up any previous temp directories..." -ForegroundColor Cyan
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir
    }

    Write-Host "2. Cloning repository from GitHub..." -ForegroundColor Cyan
    git clone $repoUrl $tempDir 2>&1

    if (-not (Test-Path $tempDir)) {
        throw "Cloning failed! Please check if git is installed and you have access to the repository."
    }
    Write-Host "3. Copying updated project files to repository..." -ForegroundColor Cyan
    if (Test-Path $sourceDir) {
        Write-Host "   Source directory exists: $sourceDir" -ForegroundColor Green
    } else {
        throw "Source directory not found at $sourceDir!"
    }
    
    # Copy index.html, css/, and js/ folders from sourceDir to tempDir root (exclude log file)
    Copy-Item -Path "$sourceDir\*" -Destination $tempDir -Recurse -Force -Exclude "update_log.txt"
    
    $destFile = Join-Path $tempDir "index.html"
    if (Test-Path $destFile) {
        Write-Host "   Project files successfully copied to local clone!" -ForegroundColor Green
    } else {
        throw "Failed to copy files to $destFile!"
    }

    Write-Host "4. Committing changes..." -ForegroundColor Cyan
    Push-Location $tempDir
    
    # Configure local author identity for this temp clone to prevent 'Author identity unknown' errors
    git config user.email "phamduyphuongwork@users.noreply.github.com"
    git config user.name "phamduyphuongwork"
    
    Write-Host "   Checking git status..." -ForegroundColor Yellow
    git status
    Write-Host "   Checking git diff..." -ForegroundColor Yellow
    git --no-pager diff
    
    git add . 2>&1
    
    $commitMsg = "Update GrammarMatrix website structure - $(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
    git commit -m $commitMsg 2>&1
    Write-Host "5. Pushing changes to GitHub..." -ForegroundColor Cyan
    git push origin main 2>&1

    Pop-Location
    Write-Host "6. Cleaning up temp files..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force $tempDir

    Write-Host "Successfully updated GrammarMatrix on GitHub with the new modular structure!" -ForegroundColor Green
} catch {
    Write-Error $_
} finally {
    Stop-Transcript
}
