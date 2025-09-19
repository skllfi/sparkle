---
title: "Disable Defender RTP"
description: "Disables Defender Real-time Protection"
hide:
  - edit
---

<!-- ⚠️ This file is auto-generated. Do not edit manually. -->

# Disable Defender RTP

## Overview
- **ID/URL**: `disable-defender-rtp`
- **Description**: Disables Defender Real-time Protection



## Details

- Sets the Defender policy DisableRealtimeMonitoring to true, instructing Windows Security to stop actively scanning files and processes in real time. For better performance





## Apply

```powershell
Set-MpPreference -DisableRealtimeMonitoring $true
```

## Unapply

```powershell
Set-MpPreference -DisableRealtimeMonitoring $false
```
