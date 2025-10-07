# Sparkle Debloat Script
# This script provides options for different debloat methods
# Made by Parcoil
# Credits to Raphire for his debloat script: https://debloat.raphi.re/
# 3rd party apps is to be added later

param(
    [string]$ScriptChoice = "",
    [string[]]$AppsToKeep = @()
)

$version = "1.0.0"

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

# list of apps to remove
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
    "Microsoft.OneDrive",
    # 3rd party apps
    "Amazon.com.Amazon",
    "AmazonVideo.PrimeVideo",
    "Disney",
    "Duolingo-LearnLanguagesforFree",
    "Facebook",
    "FarmVille2CountryEscape",
    "Instagram",
    "Netflix",
    "PandoraMediaInc.Pandora",
    "Spotify",
    "Twitter",
    "TwitterUniversal",
    "YouTube",
    "Plex",
    "TikTok",
    "TuneInRadio",
    "king.com.BubbleWitch3Saga",               
    "king.com.CandyCrushSaga",                       
    "king.com.CandyCrushSodaSaga"
)

# default apps to pre-check (these will be kept)
$defaultApps = @(
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

function Show-ScriptSelectionDialog {
    [xml]$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="(Sparkle) Debloat Script v$version" 
        Height="220" Width="550" 
        WindowStartupLocation="CenterScreen"
        Topmost="True"
        ResizeMode="NoResize">
    <Grid Margin="15">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>
        
        <TextBlock Grid.Row="0" Text="Choose your debloat approach:" 
                   FontSize="14" FontWeight="Bold" Margin="0,0,0,15"/>
        
        <StackPanel Grid.Row="1" Margin="10,0,0,0">
            <RadioButton x:Name="RadioSparkle" Content="Sparkle Debloat Script (You can choose which apps to keep) (Recommended)" 
                        Margin="0,0,0,10" IsChecked="True" FontSize="12"/>
            <RadioButton x:Name="RadioRaphire" Content="Raphire's Win11Debloat Script (Comprehensive, read docs for details)" 
                        FontSize="12"/>
        </StackPanel>
        
        <StackPanel Grid.Row="2" Orientation="Horizontal" HorizontalAlignment="Right" Margin="0,15,0,0">
            <Button x:Name="BtnOK" Content="OK" Width="80" Height="28" Margin="0,0,10,0" IsDefault="True"/>
            <Button x:Name="BtnCancel" Content="Cancel" Width="80" Height="28" IsCancel="True"/>
        </StackPanel>
    </Grid>
</Window>
"@

    $reader = New-Object System.Xml.XmlNodeReader $xaml
    $window = [Windows.Markup.XamlReader]::Load($reader)
    
    $radioSparkle = $window.FindName("RadioSparkle")
    $radioRaphire = $window.FindName("RadioRaphire")
    $btnOK = $window.FindName("BtnOK")
    $btnCancel = $window.FindName("BtnCancel")
    
    $script:dialogResult = $null
    
    $btnOK.Add_Click({
            if ($radioRaphire.IsChecked) {
                $script:dialogResult = "raphire"
            }
            else {
                $script:dialogResult = "custom"
            }
            $window.Close()
        })
    
    $btnCancel.Add_Click({
            $script:dialogResult = "cancel"
            $window.Close()
        })
    
    $window.ShowDialog() | Out-Null
    return $script:dialogResult
}



function Show-AppSelectionDialog {
    # generate friendly names for display
    $apps = @()
    foreach ($pkg in $allAppsToRemove) {
        $name = $pkg -replace "MicrosoftCorporationII\.", "" -replace "Microsoft\.", "" -replace "\.", " "
        $apps += @{ Name = $name; Package = $pkg; IsChecked = ($defaultApps -contains $pkg) }
    }
    
    [xml]$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    Title="(Sparkle) Select Apps to Keep v$version" 
    Height="650" Width="550" 
    WindowStartupLocation="CenterScreen"
    ResizeMode="NoResize">
    <Grid Margin="15">
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>   <!-- Title -->
        <RowDefinition Height="Auto"/>   <!-- Warning -->
        <RowDefinition Height="*"/>      <!-- List -->
        <RowDefinition Height="Auto"/>   <!-- Select/Deselect -->
        <RowDefinition Height="Auto"/>   <!-- OK/Cancel -->
    </Grid.RowDefinitions>
    
    <TextBlock Grid.Row="0" Text="Select the apps you want to KEEP (uncheck to remove):" 
           FontSize="14" FontWeight="Bold" Margin="0,0,0,10" TextWrapping="Wrap"/>
    <TextBlock Grid.Row="1" Text="Ensure you have a restore point before proceeding." 
           FontSize="12"  Margin="0,0,0,10"/>

    <Border Grid.Row="2" BorderBrush="#CCCCCC" BorderThickness="1" Margin="0,0,0,10">
        <ScrollViewer VerticalScrollBarVisibility="Auto" >
        <ItemsControl x:Name="AppsList" Margin="5">
            <ItemsControl.ItemTemplate>
            <DataTemplate>
                <CheckBox Content="{Binding Name}" IsChecked="{Binding IsChecked}" 
                     Margin="5,3" FontSize="11"/>
            </DataTemplate>
            </ItemsControl.ItemTemplate>
        </ItemsControl>
        </ScrollViewer>
    </Border>
    
    <StackPanel Grid.Row="3" Orientation="Horizontal" Margin="0,0,0,10">
        <Button x:Name="BtnSelectAll" Content="Select All" Width="100" Height="28" Margin="0,0,10,0"/>
        <Button x:Name="BtnDeselectAll" Content="Deselect All" Width="100" Height="28"/>
    </StackPanel>
    
    <StackPanel Grid.Row="4" Orientation="Horizontal" HorizontalAlignment="Right">
        <Button x:Name="BtnOK" Content="OK" Width="80" Height="28" Margin="0,0,10,0" IsDefault="True"/>
        <Button x:Name="BtnCancel" Content="Cancel" Width="80" Height="28" IsCancel="True"/>
    </StackPanel>
    </Grid>
</Window>
"@

    $reader = New-Object System.Xml.XmlNodeReader $xaml
    $window = [Windows.Markup.XamlReader]::Load($reader)
    
    $appsList = $window.FindName("AppsList")
    $btnSelectAll = $window.FindName("BtnSelectAll")
    $btnDeselectAll = $window.FindName("BtnDeselectAll")
    $btnOK = $window.FindName("BtnOK")
    $btnCancel = $window.FindName("BtnCancel")
    
    # create observable collection for data binding
    $observableApps = New-Object System.Collections.ObjectModel.ObservableCollection[Object]
    foreach ($app in $apps) {
        $observableApps.Add((New-Object PSObject -Property $app))
    }
    $appsList.ItemsSource = $observableApps
    
    $script:dialogResult = $null
    
    $btnSelectAll.Add_Click({
            foreach ($item in $observableApps) {
                $item.IsChecked = $true
            }
            $appsList.Items.Refresh()
        })
    
    $btnDeselectAll.Add_Click({
            foreach ($item in $observableApps) {
                $item.IsChecked = $false
            }
            $appsList.Items.Refresh()
        })
    
    $btnOK.Add_Click({
            $script:dialogResult = @()
            foreach ($item in $observableApps) {
                if ($item.IsChecked) {
                    $script:dialogResult += $item.Package
                }
            }
            $window.Close()
        })
    
    $btnCancel.Add_Click({
            $script:dialogResult = $null
            $window.Close()
            
        })
    
    $window.ShowDialog() | Out-Null
    return $script:dialogResult
}

function Remove-SelectedApps {
    param([string[]]$AppsToKeep)

    Write-Host "Starting Sparkle debloat..." -ForegroundColor Green

    $appsToRemove = $allAppsToRemove | Where-Object { $_ -notin $AppsToKeep }

    Write-Host "Apps that will be kept: $($AppsToKeep -join ', ')" -ForegroundColor Yellow
    Write-Host "Apps that will be removed: $($appsToRemove.Count)" -ForegroundColor Red
    # better method to get all of the apps properly
    foreach ($app in $appsToRemove) {
        try {
            Write-Host "Checking for installed package $app..." -ForegroundColor Yellow

            $pkg = Get-AppxPackage -Name *$app* -ErrorAction SilentlyContinue
            if ($pkg) {
                $pkg | ForEach-Object {
                    Write-Host "Removing Appx package $($_.Name)..." -ForegroundColor Yellow
                    Remove-AppxPackage -Package $_.PackageFullName -ErrorAction SilentlyContinue
                }
                Write-Host "Removed $app" -ForegroundColor Green
            }
            else {
                Write-Host "$app is not installed" -ForegroundColor Gray
            }

            $prov = Get-AppxProvisionedPackage -Online | Where-Object DisplayName -like "*$app*"
            if ($prov) {
                $prov | ForEach-Object {
                    Write-Host "Removing provisioned package $($_.DisplayName)..." -ForegroundColor Yellow
                    Remove-AppxProvisionedPackage -Online -PackageName $_.PackageName -ErrorAction SilentlyContinue
                }
            }
        }
        catch {
            Write-Host "Could not remove $app : $_" -ForegroundColor Red
        }
    }

    Write-Host "Sparkle debloat completed!" -ForegroundColor Green
}


try {
    Write-Host "Starting Sparkle Debloat script..." -ForegroundColor Green
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
            Write-Host "Running Sparkle debloat with $($AppsToKeep.Count) apps to keep..." -ForegroundColor Green
            Remove-SelectedApps -AppsToKeep $AppsToKeep
        }
        else {
            Write-Host "Custom debloat selected but no apps specified. Running with defaults..." -ForegroundColor Yellow
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
    Write-Host "Debloat Script From https://getsparkle.net" -ForegroundColor Cyan

    if (-not (Get-Process -Name "Sparkle" -ErrorAction SilentlyContinue)) {
        Add-Type -AssemblyName PresentationFramework
        
        [xml]$xaml = @"
<Window 
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    Title="Sparkle - Debloat Complete" 
    Height="150" 
    Width="400"
    WindowStartupLocation="CenterScreen">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>
        
        <TextBlock Grid.Row="0" 
                  Text="Debloat completed successfully!" 
                  FontSize="16"
                  TextWrapping="Wrap"
                  HorizontalAlignment="Center"
                  VerticalAlignment="Center"
                  TextAlignment="Center"/>
                  
        <Button Grid.Row="1" 
               x:Name="BtnOK" 
               Content="OK" 
               Width="80" 
               Margin="15"
               HorizontalAlignment="Center"/>
    </Grid>
</Window>
"@

        $reader = New-Object System.Xml.XmlNodeReader $xaml
        $window = [Windows.Markup.XamlReader]::Load($reader)
        
        $btnOK = $window.FindName("BtnOK")
        $btnOK.Add_Click({ $window.Close() })
        
        $window.ShowDialog() | Out-Null
    }

}
catch {
    Write-Host "Error during debloat process: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}