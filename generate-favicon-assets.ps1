Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function Draw-Favicon(
    [System.Drawing.Image]$sourceImage,
    [string]$path,
    [int]$size
) {
    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.Clear([System.Drawing.Color]::Transparent)

        $graphics.DrawImage(
            $sourceImage,
            [System.Drawing.Rectangle]::new(0, 0, $size, $size),
            [System.Drawing.Rectangle]::new(0, 0, $sourceImage.Width, $sourceImage.Height),
            [System.Drawing.GraphicsUnit]::Pixel
        )

        $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function Write-IcoFile(
    [string]$pngPath,
    [string]$icoPath,
    [int]$size
) {
    $pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
    $dimensionByte = if ($size -ge 256) { [byte]0 } else { [byte]$size }
    $stream = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
    $writer = New-Object System.IO.BinaryWriter $stream

    try {
        $writer.Write([UInt16]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]1)
        $writer.Write($dimensionByte)
        $writer.Write($dimensionByte)
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]32)
        $writer.Write([UInt32]$pngBytes.Length)
        $writer.Write([UInt32]22)
        $writer.Write($pngBytes)
    } finally {
        $writer.Dispose()
        $stream.Dispose()
    }
}

$root = Split-Path -Parent $PSCommandPath
$sourcePath = Join-Path $root "favicon-source.png"
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
$sizes = @{
    "favicon-16.png" = 16
    "favicon-32.png" = 32
    "favicon-192.png" = 192
    "apple-touch-icon.png" = 180
}

try {
    foreach ($entry in $sizes.GetEnumerator()) {
        Draw-Favicon $sourceImage (Join-Path $root $entry.Key) $entry.Value
    }
} finally {
    $sourceImage.Dispose()
}

Write-IcoFile (Join-Path $root "favicon-32.png") (Join-Path $root "favicon.ico") 32
