# Menu Show Delay Zero

## Overview
- **ID/URL**: `menu-show-delay-zero`
- **Description**: Removes the delay when opening menus.





## Details

- Reduces the menu show delay to 0ms for faster UI response by editing the 'MenuShowDelay' registry key.





## Apply

```powershell
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "MenuShowDelay" -Type String -Value "0"

```

## Unapply

```powershell
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "MenuShowDelay" -Type String -Value "400"

```
