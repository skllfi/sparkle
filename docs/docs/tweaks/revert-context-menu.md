---
title: "Revert Context Menu"
description: "Reverts the context menu to the default Windows 10 context menu."
hide:
  - edit
---

<!-- ⚠️ This file is auto-generated. Do not edit manually. -->

# Revert Context Menu

## Overview
- **ID/URL**: `revert-context-menu`
- **Description**: Reverts the context menu to the default Windows 10 context menu.



## Details

- Creates a blank InprocServer32 key under a specific CLSID to disable the modern right-click context menu in Windows 11, restoring the classic one and improving responsiveness in File Explorer.





## Apply

```powershell
New-Item -Path "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}" -Name "InprocServer32" -force -value ""
Stop-Process -Name "explorer" -Force
Start-Process "explorer.exe"
```

## Unapply

```powershell
Remove-Item -Path "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}" -Recurse -Confirm:$false -Force
Stop-Process -Name "explorer" -Force
Start-Process "explorer.exe"
```
