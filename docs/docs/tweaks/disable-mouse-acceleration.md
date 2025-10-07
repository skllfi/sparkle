# Disable Mouse Acceleration

## Overview
- **ID/URL**: `disable-mouse-acceleration`
- **Description**: Disables mouse acceleration for a more consistent and precise mouse movement experience. Great for gaming





## Details

- Disables Windows mouse acceleration by setting MouseSpeed, MouseThreshold1, and MouseThreshold2 to 0, enabling consistent and linear cursor movement for improved precision.





## Apply

```powershell { .no-copy }  
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseSpeed" -Value "0"
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseThreshold1" -Value "0"
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseThreshold2" -Value "0"

```

## Unapply

```powershell
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseSpeed" -Value "1"
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseThreshold1" -Value "6"
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseThreshold2" -Value "10"

```
