import { exec } from 'child_process'
import { ipcMain, shell } from 'electron'
import fs from 'fs'
import path from 'path'

function getFormattedDate() {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`
}

async function createBackup(name) {
  return new Promise((resolve, reject) => {
    const timestamp = getFormattedDate()
    const backupName = name ? `${name}_${timestamp}` : `Backup_${timestamp}`
    const backupDir = `C:\\Sparkle\\Backup\\${backupName}`

    fs.mkdirSync(backupDir, { recursive: true })

    const systemPath = path.join(backupDir, 'System.reg')
    const softwarePath = path.join(backupDir, 'Software.reg')

    const exportSystem = `reg export "HKLM\\SYSTEM" "${systemPath}" /y`
    const exportSoftware = `reg export "HKLM\\SOFTWARE" "${softwarePath}" /y`

    exec(exportSystem, (err1) => {
      if (err1) return reject(`Failed to export SYSTEM: ${err1.message}`)

      exec(exportSoftware, (err2) => {
        if (err2) return reject(`Failed to export SOFTWARE: ${err2.message}`)

        const backup = {
          name: name || 'Backup',
          description: name ? `Registry Backup: ${name}` : `Registry Backup ${timestamp}`,
          creationTime: new Date().toISOString(),
          path: backupDir
        }

        const metaPath = path.join(backupDir, 'meta.json')
        fs.writeFileSync(metaPath, JSON.stringify(backup, null, 2))

        resolve(backup)
      })
    })
  })
}

async function getBackups() {
  const backupRoot = `C:\\Sparkle\\Backup`
  if (!fs.existsSync(backupRoot)) return []

  const dirs = fs
    .readdirSync(backupRoot, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(backupRoot, dirent.name))

  const backups = []

  for (const dir of dirs) {
    const metaPath = path.join(dir, 'meta.json')
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
        backups.push(meta)
      } catch (err) {
        console.warn(`Invalid meta.json in ${dir}`, err)
      }
    }
  }

  backups.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime))
  return backups
}

async function deleteBackup(backupPath) {
  return new Promise((resolve, reject) => {
    if (!backupPath || !fs.existsSync(backupPath)) {
      return reject('Backup path does not exist')
    }
    try {
      fs.rmSync(backupPath, { recursive: true, force: true })
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

async function restoreBackup(backupPath) {
  return new Promise((resolve, reject) => {
    const systemPath = path.join(backupPath, 'System.reg')
    const softwarePath = path.join(backupPath, 'Software.reg')

    if (!fs.existsSync(systemPath) || !fs.existsSync(softwarePath)) {
      return reject('Backup files not found')
    }

    const importSystem = `reg import "${systemPath}"`
    const importSoftware = `reg import "${softwarePath}"`

    exec(importSystem, (err1) => {
      if (err1) return reject(`Failed to import SYSTEM: ${err1.message}`)

      exec(importSoftware, (err2) => {
        if (err2) return reject(`Failed to import SOFTWARE: ${err2.message}`)
        resolve()
      })
    })
  })
}

ipcMain.handle('get-backups', getBackups)

ipcMain.handle('create-backup', async (_, name) => {
  const result = await createBackup(name)
  return result
})

ipcMain.handle('open-backup-folder', async (_, folderPath) => {
  if (!folderPath) {
    console.error('open-backup-folder: folderPath is undefined')
    return
  }
  if (!fs.existsSync(folderPath)) {
    console.error('open-backup-folder: folder does not exist:', folderPath)
    return
  }
  try {
    await shell.openPath(folderPath)
  } catch (error) {
    console.error('Failed to open folder:', error)
  }
})

ipcMain.handle('delete-backup', async (_, backupPath) => {
  try {
    await deleteBackup(backupPath)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message || String(err) }
  }
})

ipcMain.handle('restore-backup', async (_, backupPath) => {
  try {
    await restoreBackup(backupPath)
    return { success: true }
  } catch (err) {
    console.error('Failed to restore backup:', err)
    return { success: false, error: err.message || String(err) }
  }
})

ipcMain.handle('create-sparkle-restore-point', async () => {
  return new Promise((resolve, reject) => {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mi = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    const label = `SparkleBackup-${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`
    const cmd = `powershell -NoProfile -Command \"Checkpoint-Computer -Description '${label}'\"`
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message)
      resolve({ success: true, label })
    })
  })
})
