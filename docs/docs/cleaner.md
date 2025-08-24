# Cleaner Page

the sparkle cleaner page has the following options:

## Clean Temporary Files

Remove system and user temporary files.

```powershell
  $systemTemp = "$env:SystemRoot\\Temp"
      $userTemp = [System.IO.Path]::GetTempPath()
      $foldersToClean = @($systemTemp, $userTemp)
      foreach ($folder in $foldersToClean) {
          if (Test-Path $folder) {
              Get-ChildItem -Path $folder -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
          }
      }

```

## Clean Prefetch Files

Delete files from the Windows Prefetch folder.

```powershell
     $prefetch = "$env:SystemRoot\\Prefetch"
      if (Test-Path $prefetch) {
          Remove-Item "$prefetch\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
```

## Empty Recycle Bin

Permanently remove files from the Recycle Bin.

```powershell
     $prefetch = "$env:SystemRoot\\Prefetch"
      if (Test-Path $prefetch) {
          Remove-Item "$prefetch\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
```

## Clean Windows Update Cache

Remove Windows Update downloaded installation files.

```powershell
 $windowsUpdateDownload = "$env:SystemRoot\\SoftwareDistribution\\Download"
      if (Test-Path $windowsUpdateDownload) {
          Remove-Item "$windowsUpdateDownload\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
```
