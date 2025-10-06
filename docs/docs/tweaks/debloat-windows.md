# Debloat Windows

## Overview
- **ID/URL**: `debloat-windows`
- **Description**: Choose between Sparkle Debloat script or Raphire's Win11Debloat script to remove built-in Windows apps and bloatware.

!!! info "Irreversible"
    This tweak cannot be reversed and must be undone manually.


## Details

## The user can choose between two methods to debloat Windows:

## 1. Raphire's Win11Debloat Script:

- This method uses a well-known script that removes a wide range of built-in Windows apps and features. It is comprehensive and suitable for users who want a quick and effective way to debloat their system.

##  2. Sparkle Custom Selective Script:

- This method allows users to select which built-in Windows apps they want to keep. A graphical interface is presented where users can check or uncheck apps from a list. 

 Both remove bloatware and privacy by removing unnecessary microsoft components, but they cater to different user preferences regarding control and convenience.



!!! tip "Recommended"
    This tweak is recommended.


## Apply

```powershell
# Sparkle Debloat Script
# This script provides options for different debloat approaches
# Made by Parcoil
# Credits to Raphire for his debloat script: https://debloat.raphi.re/
# 3rd party apps is to be added later

param(
    [string]$ScriptChoice = "",
    [string[]]$AppsToKeep = @()
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Show-ScriptSelectionDialog {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = '(Sparkle) Debloat Script v1.0.0'
    $form.Size = New-Object System.Drawing.Size(500, 200)
    $form.StartPosition = 'CenterScreen'
    $form.FormBorderStyle = 'FixedDialog'
    $form.MaximizeBox = $false

    $label = New-Object System.Windows.Forms.Label
    $label.Location = New-Object System.Drawing.Point(10, 20)
    $label.Size = New-Object System.Drawing.Size(460, 40)
    $label.Text = 'Choose your debloat approach:'
    $label.Font = New-Object System.Drawing.Font('Microsoft Sans Serif', 10, [System.Drawing.FontStyle]::Bold)
    $form.Controls.Add($label)

    $radioButton1 = New-Object System.Windows.Forms.RadioButton
    $radioButton1.Location = New-Object System.Drawing.Point(20, 85)
    $radioButton1.Size = New-Object System.Drawing.Size(450, 20)
    $radioButton1.Text = "Raphire's Win11Debloat Script (Comprehensive, read docs for details)"
    $form.Controls.Add($radioButton1)

    $radioButton2 = New-Object System.Windows.Forms.RadioButton
    $radioButton2.Location = New-Object System.Drawing.Point(20, 60)
    $radioButton2.Checked = $true
    $radioButton2.Size = New-Object System.Drawing.Size(450, 20)
    $radioButton2.Text = "Sparkle Debloat Script (You can choose which apps to keep)"
    $form.Controls.Add($radioButton2)

    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Location = New-Object System.Drawing.Point(320, 120)
    $okButton.Size = New-Object System.Drawing.Size(75, 23)
    $okButton.Text = 'OK'
    $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.AcceptButton = $okButton
    $form.Controls.Add($okButton)

    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Location = New-Object System.Drawing.Point(400, 120)
    $cancelButton.Size = New-Object System.Drawing.Size(75, 23)
    $cancelButton.Text = 'Cancel'
    $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $form.CancelButton = $cancelButton
    $form.Controls.Add($cancelButton)

    $result = $form.ShowDialog()

    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        if ($radioButton1.Checked) {
            return "raphire"
        } else {
            return "custom"
        }
    } else {
        return "cancel"
    }
}

function Show-AppSelectionDialog {
    #  list of apps to remove
    # 3rd party apps is to be added later
    $allAppsToRemove = @(
        "Clipchamp.Clipchamp",
        "Microsoft.3DBuilder",
        # this is cortana
        "Microsoft.549981C3F5F10",
        "Microsoft.BingFinance",
        "Microsoft.BingFoodAndDrink",
        "Microsoft.BingHealthAndFitness",
        "Microsoft.BingNews",
        "Microsoft.BingSports",
        "Microsoft.BingTranslator",
        "Microsoft.BingTravel",
        "Microsoft.BingWeather",
        "Microsoft.Copilot",
        "Microsoft.Getstarted",
        "Microsoft.Messaging",
        "Microsoft.Microsoft3DViewer",
        "Microsoft.MicrosoftJournal",
        "Microsoft.MicrosoftOfficeHub",
        "Microsoft.MicrosoftPowerBIForWindows",
        "Microsoft.MicrosoftSolitaireCollection",
        "Microsoft.MicrosoftStickyNotes",
        "Microsoft.MixedReality.Portal",
        "Microsoft.News",
        "Microsoft.Office.OneNote",
        "Microsoft.Office.Sway",
        "Microsoft.OneConnect",
        "Microsoft.Paint",
        "Microsoft.Print3D",
        "Microsoft.SkypeApp",
        "Microsoft.Todos",
        "Microsoft.WindowsAlarms",
        "Microsoft.WindowsCamera",
        "Microsoft.WindowsFeedbackHub",
        "Microsoft.WindowsMaps",
        "Microsoft.WindowsNotepad",
        "Microsoft.WindowsSoundRecorder",
        "Microsoft.WindowsStore",
        "Microsoft.XboxApp",
        "Microsoft.ZuneVideo",
        "MicrosoftCorporationII.MicrosoftFamily",
        "MicrosoftTeams",
        "MSTeams",
        "Microsoft.WindowsCalculator",
        "Microsoft.Windows.Photos",
        "microsoft.windowscommunicationsapps",
        "Microsoft.XboxGamingOverlay",
        "Microsoft.XboxIdentityProvider",
        "Microsoft.XboxSpeechToTextOverlay",
        "Microsoft.OneDrive"
    )

    # generate friendly names for display
    $apps = @()
    foreach ($pkg in $allAppsToRemove) {
        $name = $pkg -replace "Microsoft\.CorporationII\.", "" -replace "Microsoft\.", "" -replace "\.", " "
        $apps += @{ Name = $name; Package = $pkg }
    }

    # default apps to pre-check (these will be kept)
    $defaultApps = @(
        "Microsoft.WindowsStore",
        "Microsoft.WindowsCalculator", 
        "Microsoft.WindowsNotepad",
        "Microsoft.Paint",
        "Microsoft.Windows.Photos",
        "Microsoft.WindowsCamera",
        "Microsoft.XboxGamingOverlay",
        "Microsoft.XboxIdentityProvider",
        "Microsoft.XboxSpeechToTextOverlay",
        "Microsoft.XboxApp"
    )

    $form = New-Object System.Windows.Forms.Form
    $form.Text = '(Sparkle) Select Apps to Keep'
    $form.Size = New-Object System.Drawing.Size(500, 600)
    $form.StartPosition = 'CenterScreen'
    $form.FormBorderStyle = 'FixedDialog'
    $form.MaximizeBox = $false
    $label = New-Object System.Windows.Forms.Label
    $label.Location = New-Object System.Drawing.Point(10, 10)
    $label.Size = New-Object System.Drawing.Size(460, 40)
    $label.Text = 'Select the apps you want to KEEP (uncheck to remove):'
    $label.Font = New-Object System.Drawing.Font('Microsoft Sans Serif', 10, [System.Drawing.FontStyle]::Bold)
    $form.Controls.Add($label)

    $checkedListBox = New-Object System.Windows.Forms.CheckedListBox
    $checkedListBox.Location = New-Object System.Drawing.Point(10, 50)
    $checkedListBox.Size = New-Object System.Drawing.Size(460, 400)
    $checkedListBox.CheckOnClick = $true

    foreach ($app in $apps) {
        $isChecked = $defaultApps -contains $app.Package
        $checkedListBox.Items.Add($app.Name, $isChecked)
    }
    $form.Controls.Add($checkedListBox)

    $selectAllButton = New-Object System.Windows.Forms.Button
    $selectAllButton.Location = New-Object System.Drawing.Point(10, 460)
    $selectAllButton.Size = New-Object System.Drawing.Size(100, 23)
    $selectAllButton.Text = 'Select All'
    $selectAllButton.Add_Click({
        for ($i = 0; $i -lt $checkedListBox.Items.Count; $i++) {
            $checkedListBox.SetItemChecked($i, $true)
        }
    })
    $form.Controls.Add($selectAllButton)

    $deselectAllButton = New-Object System.Windows.Forms.Button
    $deselectAllButton.Location = New-Object System.Drawing.Point(120, 460)
    $deselectAllButton.Size = New-Object System.Drawing.Size(100, 23)
    $deselectAllButton.Text = 'Deselect All'
    $deselectAllButton.Add_Click({
        for ($i = 0; $i -lt $checkedListBox.Items.Count; $i++) {
            $checkedListBox.SetItemChecked($i, $false)
        }
    })
    $form.Controls.Add($deselectAllButton)

    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Location = New-Object System.Drawing.Point(320, 520)
    $okButton.Size = New-Object System.Drawing.Size(75, 23)
    $okButton.Text = 'OK'
    $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.AcceptButton = $okButton
    $form.Controls.Add($okButton)

    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Location = New-Object System.Drawing.Point(400, 520)
    $cancelButton.Size = New-Object System.Drawing.Size(75, 23)
    $cancelButton.Text = 'Cancel'
    $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $form.CancelButton = $cancelButton
    $form.Controls.Add($cancelButton)

    $result = $form.ShowDialog()

    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        $appsToKeep = @()
        for ($i = 0; $i -lt $checkedListBox.Items.Count; $i++) {
            if ($checkedListBox.GetItemChecked($i)) {
                $appsToKeep += $apps[$i].Package
            }
        }
        return $appsToKeep
    } else {
        return $null
    }
}


function Remove-SelectedApps {
    param([string[]]$AppsToKeep)
    
    Write-Host "Starting custom debloat process..." -ForegroundColor Green
    
    $allAppsToRemove = @(
        "Clipchamp.Clipchamp",
        "Microsoft.3DBuilder",
        "Microsoft.549981C3F5F10",
        "Microsoft.BingFinance",
        "Microsoft.BingFoodAndDrink",
        "Microsoft.BingHealthAndFitness",
        "Microsoft.BingNews",
        "Microsoft.BingSports",
        "Microsoft.BingTranslator",
        "Microsoft.BingTravel",
        "Microsoft.BingWeather",
        "Microsoft.Copilot",
        "Microsoft.Getstarted",
        "Microsoft.Messaging",
        "Microsoft.Microsoft3DViewer",
        "Microsoft.MicrosoftJournal",
        "Microsoft.MicrosoftOfficeHub",
        "Microsoft.MicrosoftPowerBIForWindows",
        "Microsoft.MicrosoftSolitaireCollection",
        "Microsoft.MicrosoftStickyNotes",
        "Microsoft.MixedReality.Portal",
        "Microsoft.NetworkSpeedTest",
        "Microsoft.News",
        "Microsoft.Office.OneNote",
        "Microsoft.Office.Sway",
        "Microsoft.OneConnect",
        "Microsoft.Paint",
        "Microsoft.Print3D",
        "Microsoft.SkypeApp",
        "Microsoft.Todos",
        "Microsoft.WindowsAlarms",
        "Microsoft.WindowsCamera",
        "Microsoft.WindowsFeedbackHub",
        "Microsoft.WindowsMaps",
        "Microsoft.WindowsNotepad",
        "Microsoft.WindowsSoundRecorder",
        "Microsoft.WindowsStore",
        "Microsoft.XboxApp",
        "Microsoft.ZuneVideo",
        "MicrosoftCorporationII.MicrosoftFamily",
        "MicrosoftTeams",
        "MSTeams",
        "Microsoft.WindowsCalculator",
        "Microsoft.Windows.Photos",
        "microsoft.windowscommunicationsapps",
        "Microsoft.XboxGamingOverlay",
        "Microsoft.XboxIdentityProvider",
        "Microsoft.XboxSpeechToTextOverlay",
        "Microsoft.OneDrive"
    )
    
    $appsToRemove = $allAppsToRemove | Where-Object { $_ -notin $AppsToKeep }
    
    Write-Host "Apps that will be kept: $($AppsToKeep -join ', ')" -ForegroundColor Yellow
    Write-Host "Apps that will be removed: $($appsToRemove.Count)" -ForegroundColor Red
    
    foreach ($app in $appsToRemove) {
        try {
            Write-Host "Removing $app..." -ForegroundColor Yellow
            Get-AppxPackage -Name $app -AllUsers | Remove-AppxPackage -ErrorAction SilentlyContinue
            Get-AppxProvisionedPackage -Online | Where-Object DisplayName -eq $app | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue
            Write-Host "Removed $app" -ForegroundColor Green
        }
        catch {
            Write-Host "Could not remove $app : $_" -ForegroundColor Red
        }
    }
    
    Write-Host "Custom debloat completed!" -ForegroundColor Green
}

# logic starts here
try {
    Write-Host "Starting Advanced Debloat Windows script..." -ForegroundColor Green
    Write-Host "Script Choice: '$ScriptChoice'" -ForegroundColor Yellow
    Write-Host "Apps to Keep Count: $($AppsToKeep.Count)" -ForegroundColor Yellow
    
    # get the ui params 
    if ($ScriptChoice -eq "raphire") {
        Write-Host "Running Raphire's Win11Debloat script..." -ForegroundColor Green
        & ([scriptblock]::Create((Invoke-RestMethod 'https://debloat.raphi.re/'))) -Silent -RemoveApps
        Write-Host "Raphire's script completed!" -ForegroundColor Green
    }
    elseif ($ScriptChoice -eq "custom") {
        if ($AppsToKeep.Count -gt 0) {
            Write-Host "Running custom debloat with $($AppsToKeep.Count) apps to keep..." -ForegroundColor Green
            Remove-SelectedApps -AppsToKeep $AppsToKeep
        } else {
            Write-Host "Custom debloat selected but no apps specified. Running with defaults..." -ForegroundColor Yellow
            # default apps to keep
            $defaultApps = @(
                "Microsoft.WindowsStore",
                "Microsoft.WindowsCalculator", 
                "Microsoft.WindowsNotepad",
                "Microsoft.Paint",
                "Microsoft.Windows.Photos"
            )
            Remove-SelectedApps -AppsToKeep $defaultApps
        }
    }
    elseif ($ScriptChoice -eq "" -or $ScriptChoice -eq $null) {
        Write-Host "No script choice provided, entering interactive mode..." -ForegroundColor Yellow
        
        try {
            $choice = Show-ScriptSelectionDialog
            
            if ($choice -eq "cancel") {
                Write-Host "Operation cancelled by user." -ForegroundColor Yellow
                exit 0
            }
            
            if ($choice -eq "raphire") {
                Write-Host "Running Raphire's Win11Debloat script..." -ForegroundColor Green
                & ([scriptblock]::Create((Invoke-RestMethod 'https://debloat.raphi.re/'))) -Silent -RemoveApps
                Write-Host "Debloat completed!" -ForegroundColor Green
            }
            elseif ($choice -eq "custom") {
                $appsToKeep = Show-AppSelectionDialog
                
                if ($appsToKeep -eq $null) {
                    Write-Host "Operation cancelled by user." -ForegroundColor Yellow
                    exit 0
                }
                
                Remove-SelectedApps -AppsToKeep $appsToKeep
            }
        }
        catch {
            Write-Host "Interactive mode failed, falling back to Raphire's script: $_" -ForegroundColor Yellow
            & ([scriptblock]::Create((Invoke-RestMethod 'https://debloat.raphi.re/'))) -Silent -RemoveApps
        }
    }
    else {
        Write-Host "Unknown script choice '$ScriptChoice', defaulting to Raphire's script..." -ForegroundColor Yellow
        & ([scriptblock]::Create((Invoke-RestMethod 'https://debloat.raphi.re/'))) -Silent -RemoveApps
    }
    
    Write-Host "Advanced debloat process completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error during debloat process: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}

```



## Links
- [Debloat Windows Script (Raphire)](https://github.com/Raphire/Win11Debloat)
