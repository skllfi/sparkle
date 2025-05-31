import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import util from 'util'
import { exec } from 'child_process'
import { app, ipcMain } from 'electron'

const execPromise = util.promisify(exec)

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

export async function executePowerShell(_, props) {
  const { script, name = 'script' } = props

  try {
    const tempDir = os.tmpdir()
    const tempFile = path.join(tempDir, `${name}-${Date.now()}.ps1`)

    await fs.writeFile(tempFile, script)

    const { stdout, stderr } = await execPromise(
      `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${tempFile}"`
    )

    await fs.unlink(tempFile).catch(console.error)

    if (stderr) {
      console.warn(`PowerShell stderr [${name}]:`, stderr)
    }

    console.log(`PowerShell stdout [${name}]:`, stdout)

    return { success: true, output: stdout }
  } catch (error) {
    console.error(`PowerShell execution error [${name}]:`, error)
    return { success: false, error: error.message }
  }
}

ipcMain.handle('run-powershell', executePowerShell)
