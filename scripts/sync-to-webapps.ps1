$ErrorActionPreference = "Stop"

$source = "C:\Users\homes\OneDrive\Desktop\JoePine.com"
$destination = "D:\WebApps\JoePine.com"

if (-not (Test-Path -LiteralPath $source)) {
    throw "Source path not found: $source"
}

if (-not (Test-Path -LiteralPath $destination)) {
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
}

$robocopyArgs = @(
    $source
    $destination
    "/MIR"
    "/FFT"
    "/R:1"
    "/W:1"
    "/XD"
    "$source\.git"
)

& robocopy @robocopyArgs | Out-Null
$exitCode = $LASTEXITCODE

if ($exitCode -gt 7) {
    throw "Robocopy failed with exit code $exitCode"
}

exit 0
