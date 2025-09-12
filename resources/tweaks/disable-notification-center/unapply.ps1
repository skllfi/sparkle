# Re-enable Notification Center by setting the value to 0
Set-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Windows\Explorer" -Name "DisableNotificationCenter" -Type DWord -Value 0

# Restart Explorer to apply changes
Stop-Process -Name explorer -Force
Start-Process explorer
