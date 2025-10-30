$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$marker = "# Block region check for AI services (added by Sparkle)"

# Check if the block exists
if (Select-String -Path $hostsFile -Pattern $marker -Quiet) {
    # Read the file content
    $content = Get-Content -Path $hostsFile

    # Find the start and end of the block
    $startLine = $content | Select-String -Pattern $marker | Select -First 1 -ExpandProperty LineNumber
    $endLine = $startLine + 5 # 1 marker line + 4 hosts entries

    # Remove the block
    $newContent = $content[0..($startLine - 2)] + $content[$endLine..($content.Length - 1)]

    # Write the new content back to the file
    Set-Content -Path $hostsFile -Value $newContent
}

# Revert system locale
Set-WinSystemLocale ru-RU
Set-WinUserLanguageList ru-RU -Force
