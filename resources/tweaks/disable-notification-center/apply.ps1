# Ensure the registry path exists
New-Item -Path "HKCU:\Software\Policies\Microsoft\Windows" -Name "Explorer" -Force | Out-Null

# Disable Notification Center (Action Center)
Set-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Windows\Explorer" -Name "DisableNotificationCenter" -Type DWord -Value 1

# Restart Explorer to apply changes
Stop-Process -Name explorer -Force
Start-Process explorer
