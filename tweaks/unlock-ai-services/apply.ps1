$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$marker = "# Block region check for AI services (added by Sparkle)"

# Check if the block already exists
if (-not (Select-String -Path $hostsFile -Pattern $marker -Quiet)) {
    # Lines to add
    $entries = @"

$marker
0.0.0.0 geo.prod.do.dsp.mp.microsoft.com
0.0.0.0 checkappexec.microsoft.com
0.0.0.0 watson.telemetry.microsoft.com
0.0.0.0 v10.events.data.microsoft.com
0.0.0.0 v20.events.data.microsoft.com
"@

    # Add the lines to the hosts file
    Add-Content -Path $hostsFile -Value $entries
}

# Change system locale
Set-WinSystemLocale en-US
Set-WinUserLanguageList en-US -Force