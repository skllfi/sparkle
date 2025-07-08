import { exec } from 'child_process'
import { ipcMain } from 'electron'

function runPowerShell(cmd) {
  return new Promise((resolve, reject) => {
    exec(
      `powershell -NoProfile -Command "${cmd}"`,
      { windowsHide: true },
      (err, stdout, stderr) => {
        if (err) return reject(stderr || err.message)
        resolve(stdout)
      }
    )
  })
}

ipcMain.handle('create-sparkle-restore-point', async () => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  const label = `SparkleBackup-${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`
  await runPowerShell(`Checkpoint-Computer -Description '${label}'`)
  return { success: true, label }
})

ipcMain.handle('create-restore-point', async (_, name) => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  const label = name
    ? `${name}-${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`
    : `ManualRestore-${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`
  await runPowerShell(`Checkpoint-Computer -Description '${label}'`)
  return { success: true, label }
})
ipcMain.handle('delete-all-restore-points', async (_, sequenceNumber) => {
  try {
    await runPowerShell(`vssadmin delete shadows /all /quiet`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting all restore points:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('get-restore-points', async () => {
  const output = await runPowerShell(
    'Get-ComputerRestorePoint | Select-Object SequenceNumber, Description, CreationTime, EventType, RestorePointType | ConvertTo-Json'
  )
  let points = []
  try {
    points = JSON.parse(output)
    if (!Array.isArray(points)) points = [points]
  } catch (e) {
    points = []
  }
  return points
})

ipcMain.handle('restore-restore-point', async (_, sequenceNumber) => {
  await runPowerShell(`Restore-Computer -RestorePoint ${sequenceNumber}`)
  return { success: true }
})
