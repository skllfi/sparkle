# Set Win32 Priority Separation

## Overview
- **ID/URL**: `set-win32-priority-separation`
- **Description**: Optimizes foreground app performance by modifying system process priority behavior.





## Details

- Sets the 'Win32PrioritySeparation' registry key to optimize foreground process priority, improving perceived responsiveness.





## Apply

```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\PriorityControl" -Name "Win32PrioritySeparation" -Type DWord -Value 36

```

## Unapply

```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\PriorityControl" -Name "Win32PrioritySeparation" -Type DWord -Value 2

```
