Add-Type -AssemblyName System.Drawing
$source = Join-Path $PSScriptRoot '../src/assets'
$dest = Join-Path $PSScriptRoot '../.optimized-assets'
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
Get-ChildItem -LiteralPath $source -Recurse -File | Where-Object { $_.Extension -in '.jpg','.png' } | ForEach-Object {
 $relative = [IO.Path]::GetRelativePath($source,$_.FullName)
 $output = Join-Path $dest ($relative + '.jpg')
 if ((Test-Path -LiteralPath $output) -and (Get-Item -LiteralPath $output).LastWriteTime -ge $_.LastWriteTime) { return }
 [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($output)) | Out-Null
 $inputImage = [Drawing.Image]::FromFile($_.FullName)
 $limit = if ($relative -match 'coursework') { 3200 } else { 2048 }
 $scale = [Math]::Min(1.0,$limit/[double][Math]::Max($inputImage.Width,$inputImage.Height))
 $bitmap = [Drawing.Bitmap]::new([int]($inputImage.Width*$scale),[int]($inputImage.Height*$scale))
 $graphics = [Drawing.Graphics]::FromImage($bitmap)
 $graphics.Clear([Drawing.Color]::White)
 $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $graphics.DrawImage($inputImage,0,0,$bitmap.Width,$bitmap.Height)
 $parameters = [Drawing.Imaging.EncoderParameters]::new(1)
 $parameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality,[long]90)
 $bitmap.Save($output,$encoder,$parameters)
 $parameters.Dispose(); $graphics.Dispose(); $bitmap.Dispose(); $inputImage.Dispose()
}
