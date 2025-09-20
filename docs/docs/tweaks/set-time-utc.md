# Set Time To UTC

## Overview
- **ID/URL**: `set-time-utc`
- **Description**: Sets the system time to UTC, Great for dual booting



## Details

- changes the system time to UTC





## Apply

```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\TimeZoneInformation" -Name "RealTimeIsUniversal" -Value 1 -Type DWord -Force
```

## Unapply

```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\TimeZoneInformation" -Name "RealTimeIsUniversal" -Value 0 -Type DWord -Force
```
