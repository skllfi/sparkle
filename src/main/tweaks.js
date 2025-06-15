function getTweaks() {
  return tweaks
}

function getTweaksFull() {
  return tweaks
}

export default {
  getTweaks,
  getTweaksFull
}

/* this is where the tweaks are defined

  title:  'Tweak Name', // Display name of the tweak shown in the UI.

  name: 'tweak-name', // Unique identifier for the tweak, used in the code and settings.

  description: 'Tweak Description',  // Short explanation of what the tweak does.

  reversible: true, // Indicates if the tweak can be reverted (unapplied). If false, it cannot be undone. but it should still be reversible somewhere on the users pc.

  modal: 'Optional modal text', // Optional text shown in a modal dialog when the tweak is applied, providing additional information or instructions.

  category: 'Tweak Category', // Group or type of tweak (e.g., Performance, Privacy) for categorizing in the UI.

  psapply: `Write-Host "Changed applyed!"` // PowerShell script that runs when the tweak is applied.,

  psunapply: `Write-Host "Changed Undone!` // PowerShell script that runs when the tweak is reverted (unapplied).

  warning:  // Optional warning message shown in the UI if the tweak is not recommended.

  restart: true,  // (Optional) Set to true if the tweak needs a system restart to fully apply.

*/

const tweaks = [
  {
    title: 'Debloat Windows',
    name: 'debloat-windows',
    description: 'Removes Unnecessary Windows Features And Apps (RECOMMENDED)',
    reversible: false,
    modal:
      'This will remove many built-in Windows apps and features, which may need to be reinstalled later. It is recommended to create a backup before applying this tweak.',
    category: ['Performance', 'Privacy'],
    psapply:
      `& ([scriptblock]::Create((Invoke-RestMethod 'https://debloat.raphi.re/'))) ` +
      `-Silent ` +
      `-RemoveApps ` +
      `-RemoveGamingApps ` +
      `-DisableTelemetry ` +
      `-DisableBing ` +
      `-DisableSuggestions ` +
      `-DisableLockscreenTips ` +
      `-RevertContextMenu ` +
      `-TaskbarAlignLeft ` +
      `-HideSearchTb ` +
      `-DisableWidgets ` +
      `-DisableCopilot ` +
      `-ExplorerToThisPC ` +
      `-ClearStartAllUsers ` +
      `-DisableDVR ` +
      `-DisableStartRecommended ` +
      `-DisableMouseAcceleration`
  },
  {
    title: 'Disable Gamebar',
    name: 'disable-gamebar',
    description: 'Disables The Xbox gamebar',
    category: ['Performance'],
    psapply: `
try {
winget uninstall 9nzkpstsnw4p --silent --accept-source-agreements 
    Get-AppxPackage Microsoft.XboxGamingOverlay | Remove-AppxPackage -ErrorAction Stop
  
    Write-Output 'Successfully removed Xbox Gaming Overlay via AppxPackage'
}
catch {
    Write-Output 'AppxPackage removal failed, trying to remove via winget'
    try {
        winget uninstall 9nzkpstsnw4p --silent --accept-source-agreements 
        Write-Output 'Successfully removed Xbox Gaming Overlay via winget'
    }
    catch {
        Write-Output 'Winget uninstall failed'
    }
}

    `,
    psunapply: `winget install 9NZKPSTSNW4P --source msstore --accept-source-agreements --accept-package-agreements`
  },
  {
    title: 'Ultimate Performance Power Plan',
    name: 'ultimate-performance-plan',
    description: 'Enables And Applys The Windows Ultimate Powerplan for better performance',
    category: ['Performance'],
    psapply: `
$ultimatePlan = powercfg -l | Select-String "Ultimate Performance"

if (-not $ultimatePlan) {
    Write-Host "Ultimate Performance plan not found. Creating..." 
    powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
} else {
    Write-Host "Ultimate Performance plan already exists." 
}

# Get the GUID of the Ultimate Performance plan
$ultimatePlanGUID = (powercfg -l | Select-String "Ultimate Performance").ToString().Split()[3]

# Set it as the active plan
powercfg -setactive $ultimatePlanGUID

Write-Host "Ultimate Performance power plan is now active." 

    `,
    psunapply: `

$balancedGUID = "381b4222-f694-41f0-9685-ff5bb260df2e"

# check if the Balanced plan exists
$balancedExists = powercfg -l | Select-String $balancedGUID

if ($balancedExists) {
    powercfg -setactive $balancedGUID
    Write-Host "Balanced power plan is now active." 
} else {
    Write-Host "Balanced power plan not found. Creating a new Balanced plan..." 
    powercfg -duplicatescheme $balancedGUID
    powercfg -setactive $balancedGUID
    Write-Host "Balanced power plan created and activated." 
}
`
  },
  {
    title: 'Disable Copilot',
    name: 'disable-copilot',
    category: ['Performance', 'Privacy'],
    description: "Removes Microsoft's Copilot feature. (will fail if copilot is not installed)",
    psapply: `Get-AppxPackage -AllUsers | Where-Object {$_.Name -Like '*Microsoft.Copilot*'} | Remove-AppxPackage -ErrorAction Continue`,
    psunapply: `winget install 9NHT9RB2F4HD --source msstore --accept-source-agreements --accept-package-agreements`
  },
  {
    title: 'Optimize Nvidia Settings',
    name: 'optimize-nvidia-settings',
    modal: 'You can revert these changes in the Nvidia control panel',
    reversible: false,
    category: ['Performance', 'GPU'],
    description: 'Changes Nvidia Control Panel settings to improve performance'
  },
  {
    title: 'Disable Location Tracking',
    name: 'disable-location-tracking',
    category: ['Privacy'],
    description: 'Disables Windows location tracking',
    psapply: `
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" -Name "Allow" -Value "Deny" -Type String -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" -Name "SensorPermissionState" -Value 0 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Diagnostics\DiagTrack" -Name "Status" -Value 0 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" -Name "AutoUpdateEnabled" -Value 0 -Type DWord -Force`,
    psunapply: `   
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" -Name "Allow" -Value "Allow" -Type String -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" -Name "SensorPermissionState" -Value 1 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Diagnostics\DiagTrack" -Name "Status" -Value 1 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" -Name "AutoUpdateEnabled" -Value 1 -Type DWord -Force
    `
  },
  {
    title: 'Run Disk Cleanup',
    name: 'run-disk-cleanup',
    category: ['General', 'Performance'],
    description: 'Runs disk cleanup on your C: drive. also removes old windows update cache',
    psapply: `
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" -Name "Allow" -Value "Deny" -Type String -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" -Name "SensorPermissionState" -Value 0 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Diagnostics\DiagTrack" -Name "Status" -Value 0 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" -Name "AutoUpdateEnabled" -Value 0 -Type DWord -Force`,
    psunapply: `   
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" -Name "Allow" -Value "Allow" -Type String -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" -Name "SensorPermissionState" -Value 1 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Diagnostics\DiagTrack" -Name "Status" -Value 1 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" -Name "AutoUpdateEnabled" -Value 1 -Type DWord -Force
    `
  },
  {
    title: 'Set Services to Manual',
    name: 'set-services-to-manual',
    category: ['Performance'],
    description: 'Sets various Windows services to Manual startup type to improve performance',
    psapply: `
    $services = @(
    @{ Name = "AJRouter"; StartupType = "Disabled" },
    @{ Name = "ALG"; StartupType = "Manual" },
    @{ Name = "AppIDSvc"; StartupType = "Manual" },
    @{ Name = "AppMgmt"; StartupType = "Manual" },
    @{ Name = "AppReadiness"; StartupType = "Manual" },
    @{ Name = "AppVClient"; StartupType = "Disabled" },
    @{ Name = "AppXSvc"; StartupType = "Manual" },
    @{ Name = "Appinfo"; StartupType = "Manual" },
    @{ Name = "AssignedAccessManagerSvc"; StartupType = "Disabled" },
    @{ Name = "AudioEndpointBuilder"; StartupType = "Automatic" },
    @{ Name = "AudioSrv"; StartupType = "Automatic" },
    @{ Name = "Audiosrv"; StartupType = "Automatic" },
    @{ Name = "AxInstSV"; StartupType = "Manual" },
    @{ Name = "BDESVC"; StartupType = "Manual" },
    @{ Name = "BFE"; StartupType = "Automatic" },
    @{ Name = "BITS"; StartupType = "AutomaticDelayedStart" },
    @{ Name = "BTAGService"; StartupType = "Manual" },
    @{ Name = "BcastDVRUserService_*"; StartupType = "Manual" },
    @{ Name = "BluetoothUserService_*"; StartupType = "Manual" },
    @{ Name = "BrokerInfrastructure"; StartupType = "Automatic" },
    @{ Name = "Browser"; StartupType = "Manual" },
    @{ Name = "BthAvctpSvc"; StartupType = "Automatic" },
    @{ Name = "BthHFSrv"; StartupType = "Automatic" },
    @{ Name = "CDPSvc"; StartupType = "Manual" },
    @{ Name = "CDPUserSvc_*"; StartupType = "Automatic" },
    @{ Name = "COMSysApp"; StartupType = "Manual" },
    @{ Name = "CaptureService_*"; StartupType = "Manual" },
    @{ Name = "CertPropSvc"; StartupType = "Manual" },
    @{ Name = "ClipSVC"; StartupType = "Manual" },
    @{ Name = "ConsentUxUserSvc_*"; StartupType = "Manual" },
    @{ Name = "CoreMessagingRegistrar"; StartupType = "Automatic" },
    @{ Name = "CredentialEnrollmentManagerUserSvc_*"; StartupType = "Manual" },
    @{ Name = "CryptSvc"; StartupType = "Automatic" },
    @{ Name = "CscService"; StartupType = "Manual" },
    @{ Name = "DPS"; StartupType = "Automatic" },
    @{ Name = "DcomLaunch"; StartupType = "Automatic" },
    @{ Name = "DcpSvc"; StartupType = "Manual" },
    @{ Name = "DevQueryBroker"; StartupType = "Manual" },
    @{ Name = "DeviceAssociationBrokerSvc_*"; StartupType = "Manual" },
    @{ Name = "DeviceAssociationService"; StartupType = "Manual" },
    @{ Name = "DeviceInstall"; StartupType = "Manual" },
    @{ Name = "DevicePickerUserSvc_*"; StartupType = "Manual" },
    @{ Name = "DevicesFlowUserSvc_*"; StartupType = "Manual" },
    @{ Name = "Dhcp"; StartupType = "Automatic" },
    @{ Name = "DiagTrack"; StartupType = "Disabled" },
    @{ Name = "DialogBlockingService"; StartupType = "Disabled" },
    @{ Name = "DispBrokerDesktopSvc"; StartupType = "Automatic" },
    @{ Name = "DisplayEnhancementService"; StartupType = "Manual" },
    @{ Name = "DmEnrollmentSvc"; StartupType = "Manual" },
    @{ Name = "Dnscache"; StartupType = "Automatic" },
    @{ Name = "DoSvc"; StartupType = "AutomaticDelayedStart" },
    @{ Name = "DsSvc"; StartupType = "Manual" },
    @{ Name = "DsmSvc"; StartupType = "Manual" },
    @{ Name = "DusmSvc"; StartupType = "Automatic" },
    @{ Name = "EFS"; StartupType = "Manual" },
    @{ Name = "EapHost"; StartupType = "Manual" },
    @{ Name = "EntAppSvc"; StartupType = "Manual" },
    @{ Name = "EventLog"; StartupType = "Automatic" },
    @{ Name = "EventSystem"; StartupType = "Automatic" },
    @{ Name = "FDResPub"; StartupType = "Manual" },
    @{ Name = "Fax"; StartupType = "Manual" },
    @{ Name = "FontCache"; StartupType = "Automatic" },
    @{ Name = "FrameServer"; StartupType = "Manual" },
    @{ Name = "FrameServerMonitor"; StartupType = "Manual" },
    @{ Name = "GraphicsPerfSvc"; StartupType = "Manual" },
    @{ Name = "HomeGroupListener"; StartupType = "Manual" },
    @{ Name = "HomeGroupProvider"; StartupType = "Manual" },
    @{ Name = "HvHost"; StartupType = "Manual" },
    @{ Name = "IEEtwCollectorService"; StartupType = "Manual" },
    @{ Name = "IKEEXT"; StartupType = "Manual" },
    @{ Name = "InstallService"; StartupType = "Manual" },
    @{ Name = "InventorySvc"; StartupType = "Manual" },
    @{ Name = "IpxlatCfgSvc"; StartupType = "Manual" },
    @{ Name = "KeyIso"; StartupType = "Automatic" },
    @{ Name = "KtmRm"; StartupType = "Manual" },
    @{ Name = "LSM"; StartupType = "Automatic" },
    @{ Name = "LanmanServer"; StartupType = "Automatic" },
    @{ Name = "LanmanWorkstation"; StartupType = "Automatic" },
    @{ Name = "LicenseManager"; StartupType = "Manual" },
    @{ Name = "LxpSvc"; StartupType = "Manual" },
    @{ Name = "MSDTC"; StartupType = "Manual" },
    @{ Name = "MSiSCSI"; StartupType = "Manual" },
    @{ Name = "MapsBroker"; StartupType = "AutomaticDelayedStart" },
    @{ Name = "McpManagementService"; StartupType = "Manual" },
    @{ Name = "MessagingService_*"; StartupType = "Manual" },
    @{ Name = "MicrosoftEdgeElevationService"; StartupType = "Manual" },
    @{ Name = "MixedRealityOpenXRSvc"; StartupType = "Manual" },
    @{ Name = "MpsSvc"; StartupType = "Automatic" },
    @{ Name = "MsKeyboardFilter"; StartupType = "Manual" },
    @{ Name = "NPSMSvc_*"; StartupType = "Manual" },
    @{ Name = "NaturalAuthentication"; StartupType = "Manual" },
    @{ Name = "NcaSvc"; StartupType = "Manual" },
    @{ Name = "NcbService"; StartupType = "Manual" },
    @{ Name = "NcdAutoSetup"; StartupType = "Manual" },
    @{ Name = "NetSetupSvc"; StartupType = "Manual" },
    @{ Name = "NetTcpPortSharing"; StartupType = "Disabled" },
    @{ Name = "Netlogon"; StartupType = "Automatic" },
    @{ Name = "Netman"; StartupType = "Manual" },
    @{ Name = "NgcCtnrSvc"; StartupType = "Manual" },
    @{ Name = "NgcSvc"; StartupType = "Manual" },
    @{ Name = "NlaSvc"; StartupType = "Manual" },
    @{ Name = "OneSyncSvc_*"; StartupType = "Automatic" },
    @{ Name = "P9RdrService_*"; StartupType = "Manual" },
    @{ Name = "PNRPAutoReg"; StartupType = "Manual" },
    @{ Name = "PNRPsvc"; StartupType = "Manual" },
    @{ Name = "PcaSvc"; StartupType = "Manual" },
    @{ Name = "PeerDistSvc"; StartupType = "Manual" },
    @{ Name = "PenService_*"; StartupType = "Manual" },
    @{ Name = "PerfHost"; StartupType = "Manual" },
    @{ Name = "PhoneSvc"; StartupType = "Manual" },
    @{ Name = "PimIndexMaintenanceSvc_*"; StartupType = "Manual" },
    @{ Name = "PlugPlay"; StartupType = "Manual" },
    @{ Name = "PolicyAgent"; StartupType = "Manual" },
    @{ Name = "Power"; StartupType = "Automatic" },
    @{ Name = "PrintNotify"; StartupType = "Manual" },
    @{ Name = "PrintWorkflowUserSvc_*"; StartupType = "Manual" },
    @{ Name = "ProfSvc"; StartupType = "Automatic" },
    @{ Name = "PushToInstall"; StartupType = "Manual" },
    @{ Name = "QWAVE"; StartupType = "Manual" },
    @{ Name = "RasAuto"; StartupType = "Manual" },
    @{ Name = "RasMan"; StartupType = "Manual" },
    @{ Name = "RemoteAccess"; StartupType = "Disabled" },
    @{ Name = "RemoteRegistry"; StartupType = "Disabled" },
    @{ Name = "RetailDemo"; StartupType = "Manual" },
    @{ Name = "RmSvc"; StartupType = "Manual" },
    @{ Name = "RpcEptMapper"; StartupType = "Automatic" },
    @{ Name = "RpcLocator"; StartupType = "Manual" },
    @{ Name = "RpcSs"; StartupType = "Automatic" },
    @{ Name = "SCPolicySvc"; StartupType = "Manual" },
    @{ Name = "SCardSvr"; StartupType = "Manual" },
    @{ Name = "SDRSVC"; StartupType = "Manual" },
    @{ Name = "SEMgrSvc"; StartupType = "Manual" },
    @{ Name = "SENS"; StartupType = "Automatic" },
    @{ Name = "SNMPTRAP"; StartupType = "Manual" },
    @{ Name = "SNMPTrap"; StartupType = "Manual" },
    @{ Name = "SSDPSRV"; StartupType = "Manual" },
    @{ Name = "SamSs"; StartupType = "Automatic" },
    @{ Name = "ScDeviceEnum"; StartupType = "Manual" },
    @{ Name = "Schedule"; StartupType = "Automatic" },
    @{ Name = "SecurityHealthService"; StartupType = "Manual" },
    @{ Name = "Sense"; StartupType = "Manual" },
    @{ Name = "SensorDataService"; StartupType = "Manual" },
    @{ Name = "SensorService"; StartupType = "Manual" },
    @{ Name = "SensrSvc"; StartupType = "Manual" },
    @{ Name = "SessionEnv"; StartupType = "Manual" },
    @{ Name = "SgrmBroker"; StartupType = "Automatic" },
    @{ Name = "SharedAccess"; StartupType = "Manual" },
    @{ Name = "SharedRealitySvc"; StartupType = "Manual" },
    @{ Name = "ShellHWDetection"; StartupType = "Automatic" },
    @{ Name = "SmsRouter"; StartupType = "Manual" },
    @{ Name = "Spooler"; StartupType = "Automatic" },
    @{ Name = "SstpSvc"; StartupType = "Manual" },
    @{ Name = "StateRepository"; StartupType = "Manual" },
    @{ Name = "StiSvc"; StartupType = "Manual" },
    @{ Name = "StorSvc"; StartupType = "Manual" },
    @{ Name = "SysMain"; StartupType = "Automatic" },
    @{ Name = "SystemEventsBroker"; StartupType = "Automatic" },
    @{ Name = "TabletInputService"; StartupType = "Manual" },
    @{ Name = "TapiSrv"; StartupType = "Manual" },
    @{ Name = "TermService"; StartupType = "Automatic" },
    @{ Name = "TextInputManagementService"; StartupType = "Manual" },
    @{ Name = "Themes"; StartupType = "Automatic" },
    @{ Name = "TieringEngineService"; StartupType = "Manual" },
    @{ Name = "TimeBroker"; StartupType = "Manual" },
    @{ Name = "TimeBrokerSvc"; StartupType = "Manual" },
    @{ Name = "TokenBroker"; StartupType = "Manual" },
    @{ Name = "TrkWks"; StartupType = "Automatic" },
    @{ Name = "TroubleshootingSvc"; StartupType = "Manual" },
    @{ Name = "TrustedInstaller"; StartupType = "Manual" },
    @{ Name = "UI0Detect"; StartupType = "Manual" },
    @{ Name = "UdkUserSvc_*"; StartupType = "Manual" },
    @{ Name = "UevAgentService"; StartupType = "Disabled" },
    @{ Name = "UmRdpService"; StartupType = "Manual" },
    @{ Name = "UnistoreSvc_*"; StartupType = "Manual" },
    @{ Name = "UserDataSvc_*"; StartupType = "Manual" },
    @{ Name = "UserManager"; StartupType = "Automatic" },
    @{ Name = "UsoSvc"; StartupType = "Manual" },
    @{ Name = "VGAuthService"; StartupType = "Automatic" },
    @{ Name = "VMTools"; StartupType = "Automatic" },
    @{ Name = "VSS"; StartupType = "Manual" },
    @{ Name = "VacSvc"; StartupType = "Manual" },
    @{ Name = "VaultSvc"; StartupType = "Automatic" },
    @{ Name = "W32Time"; StartupType = "Manual" },
    @{ Name = "WEPHOSTSVC"; StartupType = "Manual" },
    @{ Name = "WFDSConMgrSvc"; StartupType = "Manual" },
    @{ Name = "WMPNetworkSvc"; StartupType = "Manual" },
    @{ Name = "WManSvc"; StartupType = "Manual" },
    @{ Name = "WPDBusEnum"; StartupType = "Manual" },
    @{ Name = "WSService"; StartupType = "Manual" },
    @{ Name = "WSearch"; StartupType = "AutomaticDelayedStart" },
    @{ Name = "WaaSMedicSvc"; StartupType = "Manual" },
    @{ Name = "WalletService"; StartupType = "Manual" },
    @{ Name = "WarpJITSvc"; StartupType = "Manual" },
    @{ Name = "WbioSrvc"; StartupType = "Manual" },
    @{ Name = "Wcmsvc"; StartupType = "Automatic" },
    @{ Name = "WcsPlugInService"; StartupType = "Manual" },
    @{ Name = "WdNisSvc"; StartupType = "Manual" },
    @{ Name = "WdiServiceHost"; StartupType = "Manual" },
    @{ Name = "WdiSystemHost"; StartupType = "Manual" },
    @{ Name = "WebClient"; StartupType = "Manual" },
    @{ Name = "Wecsvc"; StartupType = "Manual" },
    @{ Name = "WerSvc"; StartupType = "Manual" },
    @{ Name = "WiaRpc"; StartupType = "Manual" },
    @{ Name = "WinDefend"; StartupType = "Automatic" },
    @{ Name = "WinHttpAutoProxySvc"; StartupType = "Manual" },
    @{ Name = "WinRM"; StartupType = "Manual" },
    @{ Name = "Winmgmt"; StartupType = "Automatic" },
    @{ Name = "WlanSvc"; StartupType = "Automatic" },
    @{ Name = "WpcMonSvc"; StartupType = "Manual" },
    @{ Name = "WpnService"; StartupType = "Manual" },
    @{ Name = "WpnUserService_*"; StartupType = "Automatic" },
    @{ Name = "XblAuthManager"; StartupType = "Manual" },
    @{ Name = "XblGameSave"; StartupType = "Manual" },
    @{ Name = "XboxGipSvc"; StartupType = "Manual" },
    @{ Name = "XboxNetApiSvc"; StartupType = "Manual" },
    @{ Name = "autotimesvc"; StartupType = "Manual" },
    @{ Name = "bthserv"; StartupType = "Manual" },
    @{ Name = "camsvc"; StartupType = "Manual" },
    @{ Name = "cbdhsvc_*"; StartupType = "Manual" },
    @{ Name = "cloudidsvc"; StartupType = "Manual" },
    @{ Name = "dcsvc"; StartupType = "Manual" },
    @{ Name = "defragsvc"; StartupType = "Manual" },
    @{ Name = "diagnosticshub.standardcollector.service"; StartupType = "Manual" },
    @{ Name = "diagsvc"; StartupType = "Manual" },
    @{ Name = "dmwappushservice"; StartupType = "Manual" },
    @{ Name = "dot3svc"; StartupType = "Manual" },
    @{ Name = "edgeupdate"; StartupType = "Manual" },
    @{ Name = "edgeupdatem"; StartupType = "Manual" },
    @{ Name = "embeddedmode"; StartupType = "Manual" },
    @{ Name = "fdPHost"; StartupType = "Manual" },
    @{ Name = "fhsvc"; StartupType = "Manual" },
    @{ Name = "gpsvc"; StartupType = "Automatic" },
    @{ Name = "hidserv"; StartupType = "Manual" },
    @{ Name = "icssvc"; StartupType = "Manual" },
    @{ Name = "iphlpsvc"; StartupType = "Automatic" },
    @{ Name = "lfsvc"; StartupType = "Manual" },
    @{ Name = "lltdsvc"; StartupType = "Manual" },
    @{ Name = "lmhosts"; StartupType = "Manual" },
    @{ Name = "mpssvc"; StartupType = "Automatic" },
    @{ Name = "msiserver"; StartupType = "Manual" },
    @{ Name = "netprofm"; StartupType = "Manual" },
    @{ Name = "nsi"; StartupType = "Automatic" },
    @{ Name = "p2pimsvc"; StartupType = "Manual" },
    @{ Name = "p2psvc"; StartupType = "Manual" },
    @{ Name = "perceptionsimulation"; StartupType = "Manual" },
    @{ Name = "pla"; StartupType = "Manual" },
    @{ Name = "seclogon"; StartupType = "Manual" },
    @{ Name = "shpamsvc"; StartupType = "Disabled" },
    @{ Name = "smphost"; StartupType = "Manual" },
    @{ Name = "spectrum"; StartupType = "Manual" },
    @{ Name = "sppsvc"; StartupType = "AutomaticDelayedStart" },
    @{ Name = "ssh-agent"; StartupType = "Disabled" },
    @{ Name = "svsvc"; StartupType = "Manual" },
    @{ Name = "swprv"; StartupType = "Manual" },
    @{ Name = "tiledatamodelsvc"; StartupType = "Automatic" },
    @{ Name = "tzautoupdate"; StartupType = "Disabled" },
    @{ Name = "uhssvc"; StartupType = "Disabled" },
    @{ Name = "upnphost"; StartupType = "Manual" },
    @{ Name = "vds"; StartupType = "Manual" },
    @{ Name = "vm3dservice"; StartupType = "Manual" },
    @{ Name = "vmicguestinterface"; StartupType = "Manual" },
    @{ Name = "vmicheartbeat"; StartupType = "Manual" },
    @{ Name = "vmickvpexchange"; StartupType = "Manual" },
    @{ Name = "vmicrdv"; StartupType = "Manual" },
    @{ Name = "vmicshutdown"; StartupType = "Manual" },
    @{ Name = "vmictimesync"; StartupType = "Manual" },
    @{ Name = "vmicvmsession"; StartupType = "Manual" },
    @{ Name = "vmicvss"; StartupType = "Manual" },
    @{ Name = "vmvss"; StartupType = "Manual" },
    @{ Name = "wbengine"; StartupType = "Manual" },
    @{ Name = "wcncsvc"; StartupType = "Manual" },
    @{ Name = "webthreatdefsvc"; StartupType = "Manual" },
    @{ Name = "webthreatdefusersvc_*"; StartupType = "Automatic" },
    @{ Name = "wercplsupport"; StartupType = "Manual" },
    @{ Name = "wisvc"; StartupType = "Manual" },
    @{ Name = "wlidsvc"; StartupType = "Manual" },
    @{ Name = "wlpasvc"; StartupType = "Manual" },
    @{ Name = "wmiApSrv"; StartupType = "Manual" },
    @{ Name = "workfolderssvc"; StartupType = "Manual" },
    @{ Name = "wscsvc"; StartupType = "AutomaticDelayedStart" },
    @{ Name = "wuauserv"; StartupType = "Manual" },
    @{ Name = "wudfsvc"; StartupType = "Manual" }
)

foreach ($svc in $services) {
    try {
        Set-Service -Name $svc.Name -StartupType $svc.StartupType -ErrorAction Stop
        Write-Output "Set $($svc.Name) to $($svc.StartupType)"
    } catch {
        Write-Warning "Failed to set $($svc.Name): $_"
    }
}
    `,
    psunapply: `
    $services = @(
    @{ Name = "AJRouter"; StartupType = "Manual" },
    @{ Name = "ALG"; StartupType = "Manual" },
    @{ Name = "AppIDSvc"; StartupType = "Manual" },
    @{ Name = "AppMgmt"; StartupType = "Manual" },
    @{ Name = "AppReadiness"; StartupType = "Manual" },
    @{ Name = "AppVClient"; StartupType = "Disabled" },
    @{ Name = "AppXSvc"; StartupType = "Manual" },
    @{ Name = "Appinfo"; StartupType = "Manual" },
    @{ Name = "AssignedAccessManagerSvc"; StartupType = "Manual" },
    @{ Name = "AudioEndpointBuilder"; StartupType = "Automatic" },
    @{ Name = "AudioSrv"; StartupType = "Automatic" },
    @{ Name = "Audiosrv"; StartupType = "Automatic" },
    @{ Name = "AxInstSV"; StartupType = "Manual" },
    @{ Name = "BDESVC"; StartupType = "Manual" },
    @{ Name = "BFE"; StartupType = "Automatic" },
    @{ Name = "BITS"; StartupType = "Automatic" },
    @{ Name = "BTAGService"; StartupType = "Manual" },
    @{ Name = "BcastDVRUserService_*"; StartupType = "Manual" },
    @{ Name = "BluetoothUserService_*"; StartupType = "Manual" },
    @{ Name = "BrokerInfrastructure"; StartupType = "Automatic" },
    @{ Name = "Browser"; StartupType = "Manual" },
    @{ Name = "BthAvctpSvc"; StartupType = "Automatic" },
    @{ Name = "BthHFSrv"; StartupType = "Automatic" },
    @{ Name = "CDPSvc"; StartupType = "Automatic" },
    @{ Name = "CDPUserSvc_*"; StartupType = "Automatic" },
    @{ Name = "COMSysApp"; StartupType = "Manual" },
    @{ Name = "CaptureService_*"; StartupType = "Manual" },
    @{ Name = "CertPropSvc"; StartupType = "Manual" },
    @{ Name = "ClipSVC"; StartupType = "Manual" },
    @{ Name = "ConsentUxUserSvc_*"; StartupType = "Manual" },
    @{ Name = "CoreMessagingRegistrar"; StartupType = "Automatic" },
    @{ Name = "CredentialEnrollmentManagerUserSvc_*"; StartupType = "Manual" },
    @{ Name = "CryptSvc"; StartupType = "Automatic" },
    @{ Name = "CscService"; StartupType = "Manual" },
    @{ Name = "DPS"; StartupType = "Automatic" },
    @{ Name = "DcomLaunch"; StartupType = "Automatic" },
    @{ Name = "DcpSvc"; StartupType = "Manual" },
    @{ Name = "DevQueryBroker"; StartupType = "Manual" },
    @{ Name = "DeviceAssociationBrokerSvc_*"; StartupType = "Manual" },
    @{ Name = "DeviceAssociationService"; StartupType = "Manual" },
    @{ Name = "DeviceInstall"; StartupType = "Manual" },
    @{ Name = "DevicePickerUserSvc_*"; StartupType = "Manual" },
    @{ Name = "DevicesFlowUserSvc_*"; StartupType = "Manual" },
    @{ Name = "Dhcp"; StartupType = "Automatic" },
    @{ Name = "DiagTrack"; StartupType = "Automatic" },
    @{ Name = "DialogBlockingService"; StartupType = "Disabled" },
    @{ Name = "DispBrokerDesktopSvc"; StartupType = "Automatic" },
    @{ Name = "DisplayEnhancementService"; StartupType = "Manual" },
    @{ Name = "DmEnrollmentSvc"; StartupType = "Manual" },
    @{ Name = "Dnscache"; StartupType = "Automatic" },
    @{ Name = "DoSvc"; StartupType = "Automatic" },
    @{ Name = "DsSvc"; StartupType = "Manual" },
    @{ Name = "DsmSvc"; StartupType = "Manual" },
    @{ Name = "DusmSvc"; StartupType = "Automatic" },
    @{ Name = "EFS"; StartupType = "Manual" },
    @{ Name = "EapHost"; StartupType = "Manual" },
    @{ Name = "EntAppSvc"; StartupType = "Manual" },
    @{ Name = "EventLog"; StartupType = "Automatic" },
    @{ Name = "EventSystem"; StartupType = "Automatic" },
    @{ Name = "FDResPub"; StartupType = "Manual" },
    @{ Name = "Fax"; StartupType = "Manual" },
    @{ Name = "FontCache"; StartupType = "Automatic" },
    @{ Name = "FrameServer"; StartupType = "Manual" },
    @{ Name = "FrameServerMonitor"; StartupType = "Manual" },
    @{ Name = "GraphicsPerfSvc"; StartupType = "Manual" },
    @{ Name = "HomeGroupListener"; StartupType = "Manual" },
    @{ Name = "HomeGroupProvider"; StartupType = "Manual" },
    @{ Name = "HvHost"; StartupType = "Manual" },
    @{ Name = "IEEtwCollectorService"; StartupType = "Manual" },
    @{ Name = "IKEEXT"; StartupType = "Manual" },
    @{ Name = "InstallService"; StartupType = "Manual" },
    @{ Name = "InventorySvc"; StartupType = "Manual" },
    @{ Name = "IpxlatCfgSvc"; StartupType = "Manual" },
    @{ Name = "KeyIso"; StartupType = "Automatic" },
    @{ Name = "KtmRm"; StartupType = "Manual" },
    @{ Name = "LSM"; StartupType = "Automatic" },
    @{ Name = "LanmanServer"; StartupType = "Automatic" },
    @{ Name = "LanmanWorkstation"; StartupType = "Automatic" },
    @{ Name = "LicenseManager"; StartupType = "Manual" },
    @{ Name = "LxpSvc"; StartupType = "Manual" },
    @{ Name = "MSDTC"; StartupType = "Manual" },
    @{ Name = "MSiSCSI"; StartupType = "Manual" },
    @{ Name = "MapsBroker"; StartupType = "Automatic" },
    @{ Name = "McpManagementService"; StartupType = "Manual" },
    @{ Name = "MessagingService_*"; StartupType = "Manual" },
    @{ Name = "MicrosoftEdgeElevationService"; StartupType = "Manual" },
    @{ Name = "MixedRealityOpenXRSvc"; StartupType = "Manual" },
    @{ Name = "MpsSvc"; StartupType = "Automatic" },
    @{ Name = "MsKeyboardFilter"; StartupType = "Disabled" },
    @{ Name = "NPSMSvc_*"; StartupType = "Manual" },
    @{ Name = "NaturalAuthentication"; StartupType = "Manual" },
    @{ Name = "NcaSvc"; StartupType = "Manual" },
    @{ Name = "NcbService"; StartupType = "Manual" },
    @{ Name = "NcdAutoSetup"; StartupType = "Manual" },
    @{ Name = "NetSetupSvc"; StartupType = "Manual" },
    @{ Name = "NetTcpPortSharing"; StartupType = "Disabled" },
    @{ Name = "Netlogon"; StartupType = "Automatic" },
    @{ Name = "Netman"; StartupType = "Manual" },
    @{ Name = "NgcCtnrSvc"; StartupType = "Manual" },
    @{ Name = "NgcSvc"; StartupType = "Manual" },
    @{ Name = "NlaSvc"; StartupType = "Manual" },
    @{ Name = "OneSyncSvc_*"; StartupType = "Automatic" },
    @{ Name = "P9RdrService_*"; StartupType = "Manual" },
    @{ Name = "PNRPAutoReg"; StartupType = "Manual" },
    @{ Name = "PNRPsvc"; StartupType = "Manual" },
    @{ Name = "PcaSvc"; StartupType = "Automatic" },
    @{ Name = "PeerDistSvc"; StartupType = "Manual" },
    @{ Name = "PenService_*"; StartupType = "Manual" },
    @{ Name = "PerfHost"; StartupType = "Manual" },
    @{ Name = "PhoneSvc"; StartupType = "Manual" },
    @{ Name = "PimIndexMaintenanceSvc_*"; StartupType = "Manual" },
    @{ Name = "PlugPlay"; StartupType = "Manual" },
    @{ Name = "PolicyAgent"; StartupType = "Manual" },
    @{ Name = "Power"; StartupType = "Automatic" },
    @{ Name = "PrintNotify"; StartupType = "Manual" },
    @{ Name = "PrintWorkflowUserSvc_*"; StartupType = "Manual" },
    @{ Name = "ProfSvc"; StartupType = "Automatic" },
    @{ Name = "PushToInstall"; StartupType = "Manual" },
    @{ Name = "QWAVE"; StartupType = "Manual" },
    @{ Name = "RasAuto"; StartupType = "Manual" },
    @{ Name = "RasMan"; StartupType = "Manual" },
    @{ Name = "RemoteAccess"; StartupType = "Disabled" },
    @{ Name = "RemoteRegistry"; StartupType = "Disabled" },
    @{ Name = "RetailDemo"; StartupType = "Manual" },
    @{ Name = "RmSvc"; StartupType = "Manual" },
    @{ Name = "RpcEptMapper"; StartupType = "Automatic" },
    @{ Name = "RpcLocator"; StartupType = "Manual" },
    @{ Name = "RpcSs"; StartupType = "Automatic" },
    @{ Name = "SCPolicySvc"; StartupType = "Manual" },
    @{ Name = "SCardSvr"; StartupType = "Manual" },
    @{ Name = "SDRSVC"; StartupType = "Manual" },
    @{ Name = "SEMgrSvc"; StartupType = "Manual" },
    @{ Name = "SENS"; StartupType = "Automatic" },
    @{ Name = "SNMPTRAP"; StartupType = "Manual" },
    @{ Name = "SNMPTrap"; StartupType = "Manual" },
    @{ Name = "SSDPSRV"; StartupType = "Manual" },
    @{ Name = "SamSs"; StartupType = "Automatic" },
    @{ Name = "ScDeviceEnum"; StartupType = "Manual" },
    @{ Name = "Schedule"; StartupType = "Automatic" },
    @{ Name = "SecurityHealthService"; StartupType = "Manual" },
    @{ Name = "Sense"; StartupType = "Manual" },
    @{ Name = "SensorDataService"; StartupType = "Manual" },
    @{ Name = "SensorService"; StartupType = "Manual" },
    @{ Name = "SensrSvc"; StartupType = "Manual" },
    @{ Name = "SessionEnv"; StartupType = "Manual" },
    @{ Name = "SgrmBroker"; StartupType = "Automatic" },
    @{ Name = "SharedAccess"; StartupType = "Manual" },
    @{ Name = "SharedRealitySvc"; StartupType = "Manual" },
    @{ Name = "ShellHWDetection"; StartupType = "Automatic" },
    @{ Name = "SmsRouter"; StartupType = "Manual" },
    @{ Name = "Spooler"; StartupType = "Automatic" },
    @{ Name = "SstpSvc"; StartupType = "Manual" },
    @{ Name = "StateRepository"; StartupType = "Automatic" },
    @{ Name = "StiSvc"; StartupType = "Manual" },
    @{ Name = "StorSvc"; StartupType = "Automatic" },
    @{ Name = "SysMain"; StartupType = "Automatic" },
    @{ Name = "SystemEventsBroker"; StartupType = "Automatic" },
    @{ Name = "TabletInputService"; StartupType = "Manual" },
    @{ Name = "TapiSrv"; StartupType = "Manual" },
    @{ Name = "TermService"; StartupType = "Automatic" },
    @{ Name = "TextInputManagementService"; StartupType = "Automatic" },
    @{ Name = "Themes"; StartupType = "Automatic" },
    @{ Name = "TieringEngineService"; StartupType = "Manual" },
    @{ Name = "TimeBroker"; StartupType = "Manual" },
    @{ Name = "TimeBrokerSvc"; StartupType = "Manual" },
    @{ Name = "TokenBroker"; StartupType = "Manual" },
    @{ Name = "TrkWks"; StartupType = "Automatic" },
    @{ Name = "TroubleshootingSvc"; StartupType = "Manual" },
    @{ Name = "TrustedInstaller"; StartupType = "Manual" },
    @{ Name = "UI0Detect"; StartupType = "Manual" },
    @{ Name = "UdkUserSvc_*"; StartupType = "Manual" },
    @{ Name = "UevAgentService"; StartupType = "Disabled" },
    @{ Name = "UmRdpService"; StartupType = "Manual" },
    @{ Name = "UnistoreSvc_*"; StartupType = "Manual" },
    @{ Name = "UserDataSvc_*"; StartupType = "Manual" },
    @{ Name = "UserManager"; StartupType = "Automatic" },
    @{ Name = "UsoSvc"; StartupType = "Automatic" },
    @{ Name = "VGAuthService"; StartupType = "Automatic" },
    @{ Name = "VMTools"; StartupType = "Automatic" },
    @{ Name = "VSS"; StartupType = "Manual" },
    @{ Name = "VacSvc"; StartupType = "Manual" },
    @{ Name = "VaultSvc"; StartupType = "Automatic" },
    @{ Name = "W32Time"; StartupType = "Manual" },
    @{ Name = "WEPHOSTSVC"; StartupType = "Manual" },
    @{ Name = "WFDSConMgrSvc"; StartupType = "Manual" },
    @{ Name = "WMPNetworkSvc"; StartupType = "Manual" },
    @{ Name = "WManSvc"; StartupType = "Manual" },
    @{ Name = "WPDBusEnum"; StartupType = "Manual" },
    @{ Name = "WSService"; StartupType = "Manual" },
    @{ Name = "WSearch"; StartupType = "Automatic" },
    @{ Name = "WaaSMedicSvc"; StartupType = "Manual" },
    @{ Name = "WalletService"; StartupType = "Manual" },
    @{ Name = "WarpJITSvc"; StartupType = "Manual" },
    @{ Name = "WbioSrvc"; StartupType = "Manual" },
    @{ Name = "Wcmsvc"; StartupType = "Automatic" },
    @{ Name = "WcsPlugInService"; StartupType = "Manual" },
    @{ Name = "WdNisSvc"; StartupType = "Manual" },
    @{ Name = "WdiServiceHost"; StartupType = "Manual" },
    @{ Name = "WdiSystemHost"; StartupType = "Manual" },
    @{ Name = "WebClient"; StartupType = "Manual" },
    @{ Name = "Wecsvc"; StartupType = "Manual" },
    @{ Name = "WerSvc"; StartupType = "Manual" },
    @{ Name = "WiaRpc"; StartupType = "Manual" },
    @{ Name = "WinDefend"; StartupType = "Automatic" },
    @{ Name = "WinHttpAutoProxySvc"; StartupType = "Manual" },
    @{ Name = "WinRM"; StartupType = "Manual" },
    @{ Name = "Winmgmt"; StartupType = "Automatic" },
    @{ Name = "WlanSvc"; StartupType = "Automatic" },
    @{ Name = "WpcMonSvc"; StartupType = "Manual" },
    @{ Name = "WpnService"; StartupType = "Automatic" },
    @{ Name = "WpnUserService_*"; StartupType = "Automatic" },
    @{ Name = "XblAuthManager"; StartupType = "Manual" },
    @{ Name = "XblGameSave"; StartupType = "Manual" },
    @{ Name = "XboxGipSvc"; StartupType = "Manual" },
    @{ Name = "XboxNetApiSvc"; StartupType = "Manual" },
    @{ Name = "autotimesvc"; StartupType = "Manual" },
    @{ Name = "bthserv"; StartupType = "Manual" },
    @{ Name = "camsvc"; StartupType = "Manual" },
    @{ Name = "cbdhsvc_*"; StartupType = "Automatic" },
    @{ Name = "cloudidsvc"; StartupType = "Manual" },
    @{ Name = "dcsvc"; StartupType = "Manual" },
    @{ Name = "defragsvc"; StartupType = "Manual" },
    @{ Name = "diagnosticshub.standardcollector.service"; StartupType = "Manual" },
    @{ Name = "diagsvc"; StartupType = "Manual" },
    @{ Name = "dmwappushservice"; StartupType = "Manual" },
    @{ Name = "dot3svc"; StartupType = "Manual" },
    @{ Name = "edgeupdate"; StartupType = "Automatic" },
    @{ Name = "edgeupdatem"; StartupType = "Manual" },
    @{ Name = "embeddedmode"; StartupType = "Manual" },
    @{ Name = "fdPHost"; StartupType = "Manual" },
    @{ Name = "fhsvc"; StartupType = "Manual" },
    @{ Name = "gpsvc"; StartupType = "Automatic" },
    @{ Name = "hidserv"; StartupType = "Manual" },
    @{ Name = "icssvc"; StartupType = "Manual" },
    @{ Name = "iphlpsvc"; StartupType = "Automatic" },
    @{ Name = "lfsvc"; StartupType = "Manual" },
    @{ Name = "lltdsvc"; StartupType = "Manual" },
    @{ Name = "lmhosts"; StartupType = "Manual" },
    @{ Name = "mpssvc"; StartupType = "Automatic" },
    @{ Name = "msiserver"; StartupType = "Manual" },
    @{ Name = "netprofm"; StartupType = "Manual" },
    @{ Name = "nsi"; StartupType = "Automatic" },
    @{ Name = "p2pimsvc"; StartupType = "Manual" },
    @{ Name = "p2psvc"; StartupType = "Manual" },
    @{ Name = "perceptionsimulation"; StartupType = "Manual" },
    @{ Name = "pla"; StartupType = "Manual" },
    @{ Name = "seclogon"; StartupType = "Manual" },
    @{ Name = "shpamsvc"; StartupType = "Disabled" },
    @{ Name = "smphost"; StartupType = "Manual" },
    @{ Name = "spectrum"; StartupType = "Manual" },
    @{ Name = "sppsvc"; StartupType = "Automatic" },
    @{ Name = "ssh-agent"; StartupType = "Disabled" },
    @{ Name = "svsvc"; StartupType = "Manual" },
    @{ Name = "swprv"; StartupType = "Manual" },
    @{ Name = "tiledatamodelsvc"; StartupType = "Automatic" },
    @{ Name = "tzautoupdate"; StartupType = "Disabled" },
    @{ Name = "uhssvc"; StartupType = "Disabled" },
    @{ Name = "upnphost"; StartupType = "Manual" },
    @{ Name = "vds"; StartupType = "Manual" },
    @{ Name = "vm3dservice"; StartupType = "Automatic" },
    @{ Name = "vmicguestinterface"; StartupType = "Manual" },
    @{ Name = "vmicheartbeat"; StartupType = "Manual" },
    @{ Name = "vmickvpexchange"; StartupType = "Manual" },
    @{ Name = "vmicrdv"; StartupType = "Manual" },
    @{ Name = "vmicshutdown"; StartupType = "Manual" },
    @{ Name = "vmictimesync"; StartupType = "Manual" },
    @{ Name = "vmicvmsession"; StartupType = "Manual" },
    @{ Name = "vmicvss"; StartupType = "Manual" },
    @{ Name = "vmvss"; StartupType = "Manual" },
    @{ Name = "wbengine"; StartupType = "Manual" },
    @{ Name = "wcncsvc"; StartupType = "Manual" },
    @{ Name = "webthreatdefsvc"; StartupType = "Manual" },
    @{ Name = "webthreatdefusersvc_*"; StartupType = "Automatic" },
    @{ Name = "wercplsupport"; StartupType = "Manual" },
    @{ Name = "wisvc"; StartupType = "Manual" },
    @{ Name = "wlidsvc"; StartupType = "Manual" },
    @{ Name = "wlpasvc"; StartupType = "Manual" },
    @{ Name = "wmiApSrv"; StartupType = "Manual" },
    @{ Name = "workfolderssvc"; StartupType = "Manual" },
    @{ Name = "wscsvc"; StartupType = "Automatic" },
    @{ Name = "wuauserv"; StartupType = "Manual" },
    @{ Name = "wudfsvc"; StartupType = "Manual" }
)

foreach ($svc in $services) {
    try {
        Set-Service -Name $svc.Name -StartupType $svc.StartupType -ErrorAction Stop
        Write-Output "Set $($svc.Name) to $($svc.StartupType)"
    } catch {
        Write-Warning "Failed to set $($svc.Name): $_"
    }
}
    `
  },
  {
    title: 'Enable End Task With Right Click',
    name: 'enable-end-task-right-click',
    category: ['General'],
    description: 'Enables the "End Task" option in the taskbar context menu',
    psapply: `
      $path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings"
      $name = "TaskbarEndTask"
      $value = 1

      if (-not (Test-Path $path)) {
        New-Item -Path $path -Force | Out-Null
      }
      New
      -ItemProperty -Path $path -Name $name -PropertyType DWord -Value $value -Force | Out-Null`,
    psunapply: `
      $path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings"
      $name = "TaskbarEndTask"
      $value = 0

      if (-not (Test-Path $path)) {
        New-Item -Path $path -Force | Out-Null
      }

      New-ItemProperty -Path $path -Name $name -PropertyType DWord -Value $value -Force | Out-Null
    `
  },
  {
    title: 'Disable Wifi Sense',
    name: 'disable-wifi-sense',
    category: ['Privacy', 'Network', 'General'],
    description: 'Disables Wifi Sense to prevent sharing of Wi-Fi networks with contacts',
    psapply: `
Set-ItemProperty -Path "HKLM:\Software\Microsoft\PolicyManager\default\WiFi\AllowWiFiHotSpotReporting" -Name "Value" -Type DWord -Value 0
Set-ItemProperty -Path "HKLM:\Software\Microsoft\PolicyManager\default\WiFi\AllowAutoConnectToWiFiSenseHotspots" -Name "Value" -Type DWord -Value 0
    `,
    psunapply: `
    Set-ItemProperty -Path "HKLM:\Software\Microsoft\PolicyManager\default\WiFi\AllowWiFiHotSpotReporting" -Name "Value" -Type DWord -Value 1
Set-ItemProperty -Path "HKLM:\Software\Microsoft\PolicyManager\default\WiFi\AllowAutoConnectToWiFiSenseHotspots" -Name "Value" -Type DWord -Value 1
    `
  },
  {
    title: 'Disable Telemetry',
    name: 'disable-telemetry',
    category: ['Privacy', 'Performance'],
    description: 'Disables Windows telemetry. (from ctt)',
    psapply: `
      try {
          bcdedit /set \`{current\`} bootmenupolicy Standard | Out-Null

          # Restore Task Manager Preferences if Windows build is below 22557
          if ((Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" -Name CurrentBuild).CurrentBuild -lt 22557) {
              Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\TaskManager" -Name "Preferences" -ErrorAction SilentlyContinue
          }

          # Restore "My Computer" Namespace Entry
          New-Item -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\MyComputer\\NameSpace\\{0DB7E03F-FC29-4DC6-9020-FF41B59E513A}" -Force -ErrorAction SilentlyContinue

          # Restore Edge policies
          New-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge" -Force -ErrorAction SilentlyContinue

          # Reset svchost.exe grouping to default (Default value is 0x1900000 or 26214400 KB)
          Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control" -Name "SvcHostSplitThresholdInKB" -Type DWord -Value 26214400 -Force

          # Restore AutoLogger Directory permissions
          $autoLoggerDir = "$env:PROGRAMDATA\\Microsoft\\Diagnosis\\ETLLogs\\AutoLogger"
          icacls $autoLoggerDir /remove:d SYSTEM | Out-Null

          # Enable Windows Defender Auto Sample Submission
          Set-MpPreference -SubmitSamplesConsent 1 -ErrorAction SilentlyContinue | Out-Null
      } catch {
          Write-Output "Error: $_"
      }
    `,
    psunapply: `
      try {
          bcdedit /set \`{current\`} bootmenupolicy Standard | Out-Null

          # Restore Task Manager Preferences if Windows build is below 22557
          if ((Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" -Name CurrentBuild).CurrentBuild -lt 22557) {
              Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\TaskManager" -Name "Preferences" -ErrorAction SilentlyContinue
          }

          # Restore "My Computer" Namespace Entry
          New-Item -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\MyComputer\\NameSpace\\{0DB7E03F-FC29-4DC6-9020-FF41B59E513A}" -Force -ErrorAction SilentlyContinue

          # Restore Edge policies
          New-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge" -Force -ErrorAction SilentlyContinue

          # Reset svchost.exe grouping to default (Default value is 0x1900000 or 26214400 KB)
          Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control" -Name "SvcHostSplitThresholdInKB" -Type DWord -Value 26214400 -Force

          # Restore AutoLogger Directory permissions
          $autoLoggerDir = "$env:PROGRAMDATA\\Microsoft\\Diagnosis\\ETLLogs\\AutoLogger"
          icacls $autoLoggerDir /remove:d SYSTEM | Out-Null

          # Enable Windows Defender Auto Sample Submission
          Set-MpPreference -SubmitSamplesConsent 1 -ErrorAction SilentlyContinue | Out-Null
      } catch {
          Write-Output "Error: $_"
      }
    `
  },
  {
    title: 'Disable Core Isolation',
    name: 'disable-core-isolation',
    category: ['Performance'],
    restart: true,
    description: 'Disables Core Isolation Memory Integrity to improve system performance',
    psapply: `
New-Item -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity" -Force | Out-Null

Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity" \`
    -Name "Enabled" -Value 0 -Type DWord
    `,
    psunapply: `
New-Item -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity" -Force | Out-Null

Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity" \`
    -Name "Enabled" -Value 1 -Type DWord
    `
  },
  {
    title: 'Remove OneDrive',
    name: 'remove-onedrive',
    category: ['Performance', 'General', 'Privacy'],
    description: 'Removes OneDrive from the system',
    modal:
      'This will remove OneDrive from your system. You can reinstall it later if needed. this also moves onedrive files to your home folder',
    psapply: `
      $OneDrivePath = $($env:OneDrive)
      Write-Host "Removing OneDrive"
      $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\OneDriveSetup.exe"
      if (Test-Path $regPath) {
          $OneDriveUninstallString = Get-ItemPropertyValue "$regPath" -Name "UninstallString"
          $OneDriveExe, $OneDriveArgs = $OneDriveUninstallString.Split(" ")
          Start-Process -FilePath $OneDriveExe -ArgumentList "$OneDriveArgs /silent" -NoNewWindow -Wait
      } else {
          Write-Host "Onedrive dosn't seem to be installed anymore" -ForegroundColor Red
          return
      }
      # Check if OneDrive got Uninstalled
      if (-not (Test-Path $regPath)) {
      Write-Host "Copy downloaded Files from the OneDrive Folder to Root UserProfile"
      Start-Process -FilePath powershell -ArgumentList "robocopy '$($OneDrivePath)' '$($env:USERPROFILE.TrimEnd())\' /mov /e /xj" -NoNewWindow -Wait

      Write-Host "Removing OneDrive leftovers"
      Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$env:localappdata\Microsoft\OneDrive"
      Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$env:localappdata\OneDrive"
      Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$env:programdata\Microsoft OneDrive"
      Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$env:systemdrive\OneDriveTemp"
      reg delete "HKEY_CURRENT_USER\Software\Microsoft\OneDrive" -f
      # check if directory is empty before removing:
      If ((Get-ChildItem "$OneDrivePath" -Recurse | Measure-Object).Count -eq 0) {
          Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$OneDrivePath"
      }

      Write-Host "Remove Onedrive from explorer sidebar"
      Set-ItemProperty -Path "HKCR:\CLSID\{018D5C66-4533-4307-9B53-224DE2ED1FE6}" -Name "System.IsPinnedToNameSpaceTree" -Value 0
      Set-ItemProperty -Path "HKCR:\Wow6432Node\CLSID\{018D5C66-4533-4307-9B53-224DE2ED1FE6}" -Name "System.IsPinnedToNameSpaceTree" -Value 0

      Write-Host "Removing run hook for new users"
      reg load "hku\Default" "C:\Users\Default\NTUSER.DAT"
      reg delete "HKEY_USERS\Default\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "OneDriveSetup" /f
      reg unload "hku\Default"

      Write-Host "Removing startmenu entry"
      Remove-Item -Force -ErrorAction SilentlyContinue "$env:userprofile\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\OneDrive.lnk"

      Write-Host "Removing scheduled task"
      Get-ScheduledTask -TaskPath '\' -TaskName 'OneDrive*' -ea SilentlyContinue | Unregister-ScheduledTask -Confirm:$false

      # Add Shell folders restoring default locations
      Write-Host "Shell Fixing"
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "AppData" -Value "$env:userprofile\AppData\Roaming" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Cache" -Value "$env:userprofile\AppData\Local\Microsoft\Windows\INetCache" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Cookies" -Value "$env:userprofile\AppData\Local\Microsoft\Windows\INetCookies" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Favorites" -Value "$env:userprofile\Favorites" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "History" -Value "$env:userprofile\AppData\Local\Microsoft\Windows\History" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Local AppData" -Value "$env:userprofile\AppData\Local" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "My Music" -Value "$env:userprofile\Music" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "My Video" -Value "$env:userprofile\Videos" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "NetHood" -Value "$env:userprofile\AppData\Roaming\Microsoft\Windows\Network Shortcuts" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "PrintHood" -Value "$env:userprofile\AppData\Roaming\Microsoft\Windows\Printer Shortcuts" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Programs" -Value "$env:userprofile\AppData\Roaming\Microsoft\Windows\Start Menu\Programs" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Recent" -Value "$env:userprofile\AppData\Roaming\Microsoft\Windows\Recent" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "SendTo" -Value "$env:userprofile\AppData\Roaming\Microsoft\Windows\SendTo" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Start Menu" -Value "$env:userprofile\AppData\Roaming\Microsoft\Windows\Start Menu" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Startup" -Value "$env:userprofile\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Templates" -Value "$env:userprofile\AppData\Roaming\Microsoft\Windows\Templates" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "{374DE290-123F-4565-9164-39C4925E467B}" -Value "$env:userprofile\Downloads" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Desktop" -Value "$env:userprofile\Desktop" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "My Pictures" -Value "$env:userprofile\Pictures" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "Personal" -Value "$env:userprofile\Documents" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "{F42EE2D3-909F-4907-8871-4C22FC0BF756}" -Value "$env:userprofile\Documents" -Type ExpandString
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -Name "{0DDD015D-B06C-45D5-8C4C-F59713854639}" -Value "$env:userprofile\Pictures" -Type ExpandString
      Write-Host "Restarting explorer"
      taskkill.exe /F /IM "explorer.exe"
      Start-Process "explorer.exe"

      Write-Host "Waiting for explorer to complete loading"
      Write-Host "Please Note - The OneDrive folder at $OneDrivePath may still have items in it. You must manually delete it, but all the files should already be copied to the base user folder."
      Write-Host "If there are Files missing afterwards, please Login to Onedrive.com and Download them manually" -ForegroundColor Yellow
      Start-Sleep 5
      } else {
      Write-Host "Something went Wrong during the Unistallation of OneDrive" -ForegroundColor Red
      }`,
    psunapply: `
      Write-Host "Install OneDrive"
      Start-Process -FilePath winget -ArgumentList "install -e --accept-source-agreements --accept-package-agreements --silent Microsoft.OneDrive " -NoNewWindow -Wait`
  },
  {
    title: 'Disable Background MS Store apps',
    name: 'disable-background-ms-store-apps',
    category: ['Performance', 'Privacy'],
    description: 'Disables Microsoft Store apps from running in the background (from ctt)',

    psapply: `
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications"
$name = "GlobalUserDisabled"
$newValue = 1

# Ensure the key exists
If (-Not (Test-Path $path)) {
    New-Item -Path $path -Force | Out-Null
}

# Set the value
Set-ItemProperty -Path $path -Name $name -Type DWord -Value $newValue

Write-Host "$name set to $newValue (Background Access Disabled)"
`,
    psunapply: `
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications"
$name = "GlobalUserDisabled"
$originalValue = 0

# Ensure the key exists
If (-Not (Test-Path $path)) {
    New-Item -Path $path -Force | Out-Null
}

# Revert the value
Set-ItemProperty -Path $path -Name $name -Type DWord -Value $originalValue

Write-Host "$name reverted to $originalValue (Background Access Restored)" -ForegroundColor Yellow
`
  },
  {
    title: 'Disable Hibernation',
    name: 'disable-hibernation',
    category: ['Performance', 'General'],
    warning: 'Not Recommended for laptops!',
    description:
      'Hibernation puts your computer in a low power state saving the current state to disk',
    psapply: `powercfg.exe /hibernate off`,
    psunapply: `powercfg.exe /hibernate on`
  },
  {
    title: 'Disable Fast Startup',
    name: 'disable-fast-startup',
    category: ['Performance', 'General'],
    description: 'Disables Windows Fast Startup to improve system stability',
    psapply: `Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power' -Name HiberbootEnabled -Value 0`,
    psunapply: `Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power' -Name HiberbootEnabled -Value 1`
  },
  {
    title: 'Optimize Network Settings',
    name: 'optimize-network-settings',
    category: 'Network',
    restart: true,
    description: 'changes various windows settings to improve network latency, speeds',
    psapply: `
    Write-Host "Applying network tweaks..."
    netsh int tcp set heuristics disabled
    netsh int tcp set supp internet congestionprovider=ctcp
    netsh int tcp set global rss=enabled
    netsh int tcp set global chimney=enabled
    netsh int tcp set global ecncapability=enabled
    netsh int tcp set global timestamps=disabled
    netsh int tcp set global initialRto=2000
    netsh int tcp set global rsc=disabled
    netsh int tcp set global nonsackttresiliency=disabled
    netsh int tcp set global MaxSynRetransmissions=2
    netsh int tcp set global fastopen=enabled
    netsh int tcp set global fastopenfallback=enabled
    netsh int tcp set global pacingprofile=off
    netsh int tcp set global hystart=disabled
    netsh int tcp set global dca=enabled
    netsh int tcp set global netdma=enabled
    netsh int 6to4 set state state=enabled
    netsh int udp set global uro=enabled
    netsh winsock set autotuning on
    netsh int tcp set supplemental template=custom icw=10
    netsh interface teredo set state enterprise
    netsh int tcp set security mpp=disabled
    netsh int tcp set security profiles=disabled
    netsh interface ipv4 set subinterface "Wi-Fi" mtu=1500 store=persistent
    netsh interface ipv4 set subinterface Ethernet mtu=1500 store=persistent

    Write-Host "Network tweaks applied."    
`,
    psunapply: `
    Write-Host "Reverting network tweaks to defaults..."
    netsh int tcp set heuristics enabled
    netsh int tcp set supp internet congestionprovider=default
    netsh int tcp set global rss=disabled
    netsh int tcp set global chimney=disabled
    netsh int tcp set global ecncapability=disabled
    netsh int tcp set global timestamps=enabled
    netsh int tcp set global initialRto=3000
    netsh int tcp set global rsc=enabled
    netsh int tcp set global nonsackttresiliency=enabled
    netsh int tcp set global MaxSynRetransmissions=5
    netsh int tcp set global fastopen=disabled
    netsh int tcp set global fastopenfallback=disabled
    netsh int tcp set global pacingprofile=normal
    netsh int tcp set global hystart=enabled
    netsh int tcp set global dca=disabled
    netsh int tcp set global netdma=disabled
    netsh int 6to4 set state state=disabled
    netsh int udp set global uro=disabled
    netsh winsock set autotuning default
    netsh int tcp set supplemental template=default icw=4
    netsh interface teredo set state disabled
    netsh int tcp set security mpp=enabled
    netsh int tcp set security profiles=enabled
    # Reset MTU to default (usually 1500 is default, so you might omit this or adjust)
    netsh interface ipv4 set subinterface "Wi-Fi" mtu=1500 store=persistent
    netsh interface ipv4 set subinterface Ethernet mtu=1500 store=persistent
    Write-Host "Network tweaks reverted."`
  },
  {
    title: 'Disable Defender RTP',
    name: 'disable-defender-rtp',
    category: ['Performance', 'General'],
    description: 'Disables Defender Real-time Protection',
    warning: 'Makes Windows more vulnerable to malware',
    psapply: `Set-MpPreference -DisableRealtimeMonitoring $true`,

    psunapply: `Set-MpPreference -DisableRealtimeMonitoring $false`
  },
  {
    title: 'Disable Dynamic Ticking',
    name: 'disable-dynamic-ticking',
    category: 'Performance',
    warning: 'May increase power consumption',
    description:
      'Improves system responsiveness and reduces latency by disabling dynamic timer ticks.',
    psapply: `
try {
  bcdedit /set disabledynamictick yes
  Write-Host "Dynamic Ticking disabled successfully"
} catch {
  Write-Host "Failed to apply Dynamic Ticking tweak"
}
`,
    psunapply: `
try {
  bcdedit /set disabledynamictick no
  Write-Host "Dynamic Ticking settings restored"
} catch {
  Write-Host "Failed to revert Dynamic Ticking tweak"
}
`
  },
  {
    title: 'Enable HPET (High Precision Event Timer)',
    name: 'enable-hpet',
    category: ['Performance'],
    warning: 'May increase input latency on some systems',
    description:
      'Forces use of the High Precision Event Timer (HPET), which can reduce stuttering and improve timing accuracy on some hardware.',
    psapply: `
try {
  bcdedit /set useplatformclock true
  Write-Host "HPET enabled successfully"
} catch {
  Write-Host "Failed to enable HPET"
}
`,
    psunapply: `
try {
  bcdedit /deletevalue useplatformclock
  Write-Host "HPET setting removed"
} catch {
  Write-Host "Failed to disable HPET"
}
`
  }
]
