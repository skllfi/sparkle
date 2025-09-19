---
title: "Disable Lockscreen Tips"
description: "Disables tips on the lockscreen."
hide:
  - edit
---

<!-- ⚠️ This file is auto-generated. Do not edit manually. -->

# Disable Lockscreen Tips

## Overview
- **ID/URL**: `disable-lockscreen-tips`
- **Description**: Disables tips on the lockscreen.









## Apply

```powershell
# Disable fun facts, tips, and more on the lock screen
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "RotatingLockScreenOverlayEnabled" -Value 0 -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-338387Enabled" -Value 0 -Type DWord

```

## Unapply

```powershell
# Enable fun facts, tips, and more on the lock screen
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "RotatingLockScreenOverlayEnabled" -Value 1 -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-338387Enabled" -Value 1 -Type DWord

```
