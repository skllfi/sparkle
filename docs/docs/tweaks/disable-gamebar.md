# Disable Gamebar
ID/URL: disable-gamebar

Description: Disables The Xbox gamebar (do not apply if you have a X3D cpu)

- Attempts to remove Xbox Gaming Overlay using Remove-AppxPackage, with a fallback to winget, to eliminate background Xbox services and overlays that can consume CPU, RAM, and GPU resources, improving system performance and reducing in-game interruptions.



## Apply
```powershell
try {
    winget uninstall 9nzkpstsnw4p --silent --accept-source-agreements 
        Get-AppxPackage Microsoft.XboxGamingOverlay | Remove-AppxPackage -ErrorAction Stop
      
        Write-Output 'Successfully removed Xbox Gaming Overlay via AppxPackage'
    }
    catch {
        Write-Output 'AppxPackage removal failed, trying to remove via winget'
        try {
            winget uninstall 9nzkpstsnw4p --silent --accept-source-agreements 
            Write-Output 'Successfully removed Xbox Gaming Overlay via winget'
        }
        catch {
            Write-Output 'Winget uninstall failed'
        }
    }
```

## Unapply
```powershell
winget install 9NZKPSTSNW4P --source msstore --accept-source-agreements --accept-package-agreements
```
