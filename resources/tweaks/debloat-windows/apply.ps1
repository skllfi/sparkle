& ([scriptblock]::Create((Invoke-RestMethod 'https://debloat.raphi.re/'))) `
  -Silent `
  -RemoveApps `
  -RemoveGamingApps `
  -DisableTelemetry `
  -ExplorerToThisPC `
  -DisableDVR `
