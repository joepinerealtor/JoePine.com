Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-Color([string]$hex) {
    return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-RoundedRectPath(
    [float]$x,
    [float]$y,
    [float]$width,
    [float]$height,
    [float]$radius
) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath

    if ($radius -le 0) {
        $path.AddRectangle([System.Drawing.RectangleF]::new($x, $y, $width, $height))
        $path.CloseFigure()
        return $path
    }

    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    return $path
}

function Fill-RoundedRect(
    [System.Drawing.Graphics]$graphics,
    [System.Drawing.Brush]$brush,
    [float]$x,
    [float]$y,
    [float]$width,
    [float]$height,
    [float]$radius
) {
    $path = New-RoundedRectPath $x $y $width $height $radius
    try {
        $graphics.FillPath($brush, $path)
    } finally {
        $path.Dispose()
    }
}

function Draw-RoundedRect(
    [System.Drawing.Graphics]$graphics,
    [System.Drawing.Pen]$pen,
    [float]$x,
    [float]$y,
    [float]$width,
    [float]$height,
    [float]$radius
) {
    $path = New-RoundedRectPath $x $y $width $height $radius
    try {
        $graphics.DrawPath($pen, $path)
    } finally {
        $path.Dispose()
    }
}

function Draw-IconImage([string]$path, [int]$size) {
    $terracotta = New-Color "#b40101"
    $cream = New-Color "#ffffff"

    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.Clear([System.Drawing.Color]::Transparent)

        $backgroundBrush = New-Object System.Drawing.SolidBrush $terracotta
        $houseBrush = New-Object System.Drawing.SolidBrush $cream
        $cutoutBrush = New-Object System.Drawing.SolidBrush $terracotta

        try {
            $cornerRadius = [math]::Round($size * 0.18)
            Fill-RoundedRect $graphics $backgroundBrush 0 0 $size $size $cornerRadius

            $roofPoints = @(
                [System.Drawing.PointF]::new($size * 0.20, $size * 0.43),
                [System.Drawing.PointF]::new($size * 0.50, $size * 0.17),
                [System.Drawing.PointF]::new($size * 0.80, $size * 0.43)
            )
            $graphics.FillPolygon($houseBrush, $roofPoints)
            $graphics.FillRectangle($houseBrush, $size * 0.25, $size * 0.41, $size * 0.50, $size * 0.36)
            $graphics.FillRectangle($cutoutBrush, $size * 0.44, $size * 0.53, $size * 0.12, $size * 0.24)
        } finally {
            $backgroundBrush.Dispose()
            $houseBrush.Dispose()
            $cutoutBrush.Dispose()
        }

        $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function Draw-StepPill(
    [System.Drawing.Graphics]$graphics,
    [float]$x,
    [float]$y,
    [float]$width,
    [float]$height,
    [string]$number,
    [string]$label,
    [System.Drawing.Font]$numberFont,
    [System.Drawing.Font]$labelFont,
    [System.Drawing.Color]$fillColor,
    [System.Drawing.Color]$borderColor,
    [System.Drawing.Color]$circleFillColor,
    [System.Drawing.Color]$numberColor,
    [System.Drawing.Color]$labelColor
) {
    $fillBrush = New-Object System.Drawing.SolidBrush $fillColor
    $borderPen = New-Object System.Drawing.Pen $borderColor, 1
    $circleBrush = New-Object System.Drawing.SolidBrush $circleFillColor
    $numberBrush = New-Object System.Drawing.SolidBrush $numberColor
    $labelBrush = New-Object System.Drawing.SolidBrush $labelColor
    $format = New-Object System.Drawing.StringFormat

    try {
        Fill-RoundedRect $graphics $fillBrush $x $y $width $height 22
        Draw-RoundedRect $graphics $borderPen $x $y $width $height 22

        $circleSize = 28
        $circleX = $x + 12
        $circleY = $y + 12
        $graphics.FillEllipse($circleBrush, $circleX, $circleY, $circleSize, $circleSize)

        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $graphics.DrawString($number, $numberFont, $numberBrush, [System.Drawing.RectangleF]::new($circleX, $circleY - 1, $circleSize, $circleSize), $format)

        $format.Alignment = [System.Drawing.StringAlignment]::Near
        $format.LineAlignment = [System.Drawing.StringAlignment]::Near
        $graphics.DrawString($label, $labelFont, $labelBrush, [System.Drawing.RectangleF]::new($x + 12, $y + 48, $width - 24, $height - 58), $format)
    } finally {
        $fillBrush.Dispose()
        $borderPen.Dispose()
        $circleBrush.Dispose()
        $numberBrush.Dispose()
        $labelBrush.Dispose()
        $format.Dispose()
    }
}

$root = Split-Path -Parent $PSCommandPath
$previewPath = Join-Path $root "social-preview.png"
$favicon32Path = Join-Path $root "favicon-32.png"
$favicon192Path = Join-Path $root "favicon-192.png"
$appleTouchPath = Join-Path $root "apple-touch-icon.png"

$terracotta = New-Color "#b40101"
$terracottaDeep = New-Color "#8f0000"
$terracottaBright = New-Color "#d20d0d"
$terracottaSoft = New-Color "#d34141"
$pageWhite = New-Color "#fbfaf8"
$panelOutline = [System.Drawing.Color]::FromArgb(56, 255, 255, 255)
$cardRed = [System.Drawing.Color]::FromArgb(34, 255, 255, 255)
$cardRedLine = [System.Drawing.Color]::FromArgb(74, 255, 255, 255)
$ink = New-Color "#040404"
$inkSoft = New-Color "#57524d"
$white = New-Color "#ffffff"
$whiteSoft = [System.Drawing.Color]::FromArgb(218, 255, 255, 255)
$softPink = New-Color "#f6e3e1"
$shadow = [System.Drawing.Color]::FromArgb(18, 0, 0, 0)
$railRed = [System.Drawing.Color]::FromArgb(34, 255, 255, 255)
$railBorder = [System.Drawing.Color]::FromArgb(52, 255, 255, 255)
$stepDot = New-Color "#f5d9d7"
$stepDotText = New-Color "#bd1c1c"
$progressTrack = [System.Drawing.Color]::FromArgb(44, 255, 255, 255)
$progressFill = $softPink

$bitmap = New-Object System.Drawing.Bitmap 1200, 630
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $pageBrush = New-Object System.Drawing.SolidBrush $pageWhite
    $graphics.FillRectangle($pageBrush, 0, 0, 1200, 630)
    $pageBrush.Dispose()

    $panelShadowBrush = New-Object System.Drawing.SolidBrush $shadow
    Fill-RoundedRect $graphics $panelShadowBrush 52 44 1120 548 36
    $panelShadowBrush.Dispose()

    $panelBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
        [System.Drawing.Rectangle]::new(40, 34, 1128, 552),
        $terracottaBright,
        $terracotta,
        90
    )
    $panelPen = New-Object System.Drawing.Pen $panelOutline, 1

    try {
        Fill-RoundedRect $graphics $panelBrush 40 34 1128 552 36
        Draw-RoundedRect $graphics $panelPen 40 34 1128 552 36
    } finally {
        $panelBrush.Dispose()
        $panelPen.Dispose()
    }

    $eyebrowFont = New-Object System.Drawing.Font "Segoe UI Bold", 17, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
    $headlineFont = New-Object System.Drawing.Font "Arial", 34, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $bodyFont = New-Object System.Drawing.Font "Arial", 16, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $progressEyebrowFont = New-Object System.Drawing.Font "Segoe UI Bold", 16, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
    $progressTitleFont = New-Object System.Drawing.Font "Segoe UI Bold", 18, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
    $progressBodyFont = New-Object System.Drawing.Font "Segoe UI Semibold", 15, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
    $stepNumberFont = New-Object System.Drawing.Font "Segoe UI Bold", 14, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
    $stepLabelFont = New-Object System.Drawing.Font "Segoe UI Bold", 15, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
    $panelEyebrowFont = New-Object System.Drawing.Font "Segoe UI Bold", 16, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
    $panelHeadingFont = New-Object System.Drawing.Font "Arial", 30, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $panelBodyFont = New-Object System.Drawing.Font "Segoe UI Semibold", 15, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)

    $whiteBrush = New-Object System.Drawing.SolidBrush $white
    $whiteSoftBrush = New-Object System.Drawing.SolidBrush $whiteSoft
    $inkBrush = New-Object System.Drawing.SolidBrush $ink
    $inkSoftBrush = New-Object System.Drawing.SolidBrush $inkSoft

    try {
        $textFormat = New-Object System.Drawing.StringFormat
        $textFormat.Trimming = [System.Drawing.StringTrimming]::Word

        $graphics.DrawString("FIRST STEPS TOWARD BUYING", $eyebrowFont, $whiteSoftBrush, 92, 78)
        $graphics.DrawString(
            "IF YOU ARE NOT SURE WHERE`nTO BEGIN, YOU ARE IN THE`nRIGHT PLACE.",
            $headlineFont,
            $whiteBrush,
            [System.Drawing.RectangleF]::new(92, 116, 612, 140),
            $textFormat
        )

        $graphics.DrawString(
            "This workbook is for someone who wants to buy a home but is not quite sure they are ready yet. You do not need perfect credit or every answer today, just a clearer next step.",
            $bodyFont,
            $whiteBrush,
            [System.Drawing.RectangleF]::new(92, 252, 550, 68),
            $textFormat
        )
        $graphics.DrawString(
            "Move through the steps one at a time and use this as a calm place to understand what matters now, what can wait, and how to build a real plan before you talk with a lender.",
            $bodyFont,
            $whiteBrush,
            [System.Drawing.RectangleF]::new(92, 324, 572, 72),
            $textFormat
        )

        $progressCardBrush = New-Object System.Drawing.SolidBrush $cardRed
        $progressCardPen = New-Object System.Drawing.Pen $cardRedLine, 1
        try {
            Fill-RoundedRect $graphics $progressCardBrush 710 52 428 150 24
            Draw-RoundedRect $graphics $progressCardPen 710 52 428 150 24
        } finally {
            $progressCardBrush.Dispose()
            $progressCardPen.Dispose()
        }

        $graphics.DrawString("WHERE YOU ARE", $progressEyebrowFont, $whiteSoftBrush, 728, 72)
        $graphics.DrawString("Step 1 of 12", $progressTitleFont, $whiteBrush, 728, 104)
        $graphics.DrawString(
            "You are on 01 5-Year Cost. Use the left rail to move at your own pace.",
            $progressBodyFont,
            $whiteBrush,
            [System.Drawing.RectangleF]::new(728, 132, 378, 50),
            $textFormat
        )

        $trackBrush = New-Object System.Drawing.SolidBrush $progressTrack
        $fillBrush = New-Object System.Drawing.SolidBrush $progressFill
        try {
            Fill-RoundedRect $graphics $trackBrush 728 180 372 8 4
            Fill-RoundedRect $graphics $fillBrush 728 180 36 8 4
        } finally {
            $trackBrush.Dispose()
            $fillBrush.Dispose()
        }

        Draw-StepPill $graphics 92 380 92 92 "01" "5-YEAR`nCOST" $stepNumberFont $stepLabelFont $white $white $softPink $stepDotText $terracotta
        Draw-StepPill $graphics 92 486 92 100 "02" "BUYING`nLATER" $stepNumberFont $stepLabelFont $railRed $railBorder $softPink $stepDotText $white

        $railBarBrush = New-Object System.Drawing.SolidBrush $cardRedLine
        $railThumbBrush = New-Object System.Drawing.SolidBrush $softPink
        try {
            Fill-RoundedRect $graphics $railBarBrush 192 380 8 202 4
            Fill-RoundedRect $graphics $railThumbBrush 192 386 8 36 4
        } finally {
            $railBarBrush.Dispose()
            $railThumbBrush.Dispose()
        }

        $contentShadowBrush = New-Object System.Drawing.SolidBrush $shadow
        $contentBrush = New-Object System.Drawing.SolidBrush $white
        try {
            Fill-RoundedRect $graphics $contentShadowBrush 238 390 882 218 30
            Fill-RoundedRect $graphics $contentBrush 224 376 890 218 30
        } finally {
            $contentShadowBrush.Dispose()
            $contentBrush.Dispose()
        }

        $graphics.DrawString("STEP 1", $panelEyebrowFont, $inkSoftBrush, 248, 406)
        $graphics.DrawString(
            "START WITH THE FIVE-YEAR COST`nPICTURE.",
            $panelHeadingFont,
            $inkBrush,
            [System.Drawing.RectangleF]::new(248, 430, 760, 88),
            $textFormat
        )
        $graphics.DrawString(
            "This is the immediate cost comparison. In this Rhode Island example, the renter paid for housing while the buyer may have spent almost the same each month and still built wealth over those same five years.",
            $panelBodyFont,
            $inkSoftBrush,
            [System.Drawing.RectangleF]::new(248, 520, 740, 54),
            $textFormat
        )

        $contentBarBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(26, 180, 1, 1))
        $contentThumbBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(78, 180, 1, 1))
        try {
            Fill-RoundedRect $graphics $contentBarBrush 1118 378 8 208 4
            Fill-RoundedRect $graphics $contentThumbBrush 1118 382 8 34 4
        } finally {
            $contentBarBrush.Dispose()
            $contentThumbBrush.Dispose()
        }

        $textFormat.Dispose()
    } finally {
        $eyebrowFont.Dispose()
        $headlineFont.Dispose()
        $bodyFont.Dispose()
        $progressEyebrowFont.Dispose()
        $progressTitleFont.Dispose()
        $progressBodyFont.Dispose()
        $stepNumberFont.Dispose()
        $stepLabelFont.Dispose()
        $panelEyebrowFont.Dispose()
        $panelHeadingFont.Dispose()
        $panelBodyFont.Dispose()
        $whiteBrush.Dispose()
        $whiteSoftBrush.Dispose()
        $inkBrush.Dispose()
        $inkSoftBrush.Dispose()
    }

    $bitmap.Save($previewPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $graphics.Dispose()
    $bitmap.Dispose()
}

Draw-IconImage $favicon32Path 32
Draw-IconImage $favicon192Path 192
Draw-IconImage $appleTouchPath 180
