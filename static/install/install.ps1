$Target = "1.0.3-beta" # latest version
if (-not ($args.Length -eq 0)) {
    $Target = $args[0]
}

function Ensure-Admin {
    if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
        Start-Process powershell -Verb runAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" $Target"
        exit
    }
}
Ensure-Admin

$OldZepDir = "C:/Users/Public/AppData/Local/zeP"
$OldZepZepExe = "C:/Users/Public/AppData/Local/zeP/zep/e/zep.exe"
$OldZepZigExe = "C:/Users/Public/AppData/Local/zeP/zig/e/zig.exe"

$ZepDir = "C:$Env:HOMEPATH/.zep"
$Bin = "$ZepDir/bin"
# Move the old paths contents to the new path
if (Test-Path $OldZepDir -PathType Container) {
    if (!(Test-Path $ZepDir)) {
        New-Item -ItemType Directory -Path $ZepDir | Out-Null
    }

    Move-Item -Path (Join-Path $OldZepDir '*') -Destination $ZepDir -Force

    Remove-Item $OldZepDir -Recurse -Force
}

if (Test-Path $OldZepZepExe) {
    Rename-Item $OldZepZepExe "$Bin/zep.exe"
}
if (Test-Path $OldZepZigExe) {
    Rename-Item $OldZepZigExe "$Bin/zig.exe"
}


$ZepZigDir = Join-Path $ZepDir "zig/"
$ZepZepDir = Join-Path $ZepDir "zep/"
$TempZepZigDir = Join-Path $ZepDir "tmp/"
$TempZepZigFile = Join-Path $TempZepZigDir "$Target.zip"

$ManifestZep = Join-Path $ZepDir "zep/manifest.json"
$ManifestZig = Join-Path $ZepDir "zig/manifest.json"

$ExeZepFile = Join-Path $Bin "zep.exe"
$ExeZigFile = Join-Path $Bin "zig.exe"


$ZepExeDest = Join-Path $ZepDir "zep/d/$Target/x86_64-windows"
if (Test-Path $ZepExeDest -PathType Container) {
    Remove-Item -Path $ZepExeDest -Force -Recurse
}

$ZepTargetFile = Join-Path $ZepExeDest "zeP.exe"
if (-not (Test-Path $ZepTargetFile)) {
    $ZepTargetFile = Join-Path $ZepExeDest "zep.exe"
}

function Set-EnvVar {
    $UserPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if (-not ($UserPath.Split(';') -contains $Bin)) {
        $NewPath = $Bin + ";" + $UserPath
        [Environment]::SetEnvironmentVariable("Path", $NewPath, "Machine")
    }
}

function Set-Up {
    New-Item -Path $Bin -ItemType Directory -Force | Out-Null
    New-Item -Path $ZepDir -ItemType Directory -Force | Out-Null
    
    New-Item -Path $ZepZigDir -ItemType Directory -Force | Out-Null
    New-Item -Path $ZepZepDir -ItemType Directory -Force | Out-Null

    New-Item -Path $TempZepZigDir -ItemType Directory -Force | Out-Null
    New-Item -Path $TempZepZigFile -ItemType File -Force | Out-Null

    New-Item -Path $ZepExeDest -ItemType Directory -Force | Out-Null

    New-Item -Path $ManifestZep -ItemType File -Force | Out-Null

    $data = @{
        name = "zep_x86_64-windows_$Target"
        path = "$ZepExeDest"
    }
    $data | ConvertTo-Json -Depth 10 | Set-Content "$ManifestZep"

    Set-EnvVar
}
Set-Up

function Get-Download {
    Invoke-WebRequest -uri "https://zep.run/releases/$TARGET/zep_x86_64-windows_$TARGET.zip" -Method "GET"  -Outfile $TempZepZigFile
    Expand-Archive $TempZepZigFile -DestinationPath $DestZepZigDir
    Remove-Item -Path $TempZepZigDir -Force -Recurse
}
Get-Download


if (Test-Path $ExeZepFile) { Remove-Item $ExeZepFile -Force }
New-Item -ItemType SymbolicLink -Target $ZepTargetFile -Path $ExeZepFile | Out-Null  # exeZep is the symlink

Write-Host "Installation finished for zeP version $Target."
Write-Host "The location of the executeable is: $ExeZepFile"
Write-Host "You may need to restart your Terminal. After that run '$ zep help', for checking."
