import { ipcMain, app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logo } from './index'
import Tweaks from './tweaks.js'

const execPromise = promisify(exec)
const userDataPath = app.getPath('userData')
const tweaksStatePath = path.join(userDataPath, 'tweakStates.json')
const isDev = !app.isPackaged

const getExePath = (exeName) => {
  if (isDev) {
    return path.resolve(process.cwd(), 'resources', exeName)
  }
  return path.join(process.resourcesPath, exeName)
}

const getNipPath = () => {
  if (isDev) {
    return path.resolve(process.cwd(), 'resources', 'sparklenvidia.nip')
  }
  return path.join(process.resourcesPath, 'sparklenvidia.nip')
}

async function runPowerShellScript(script, name) {
  const tempDir = app.getPath('temp')
  const tempFile = path.join(tempDir, `${name}-${Date.now()}.ps1`)

  await fs.writeFile(tempFile, script)

  const { stdout, stderr } = await execPromise(
    `powershell -ExecutionPolicy Bypass -File "${tempFile}"`
  )

  await fs.unlink(tempFile).catch(console.error)

  if (stderr) console.warn(`Warning running PowerShell for ${name}:`, stderr)
  console.log(logo, `${name}:`, stdout)

  return { success: true, output: stdout }
}

function NvidiaProfileInspector() {
  const exePath = getExePath('nvidiaProfileInspector.exe')
  const nipPath = getNipPath()
  return new Promise((resolve, reject) => {
    exec(`"${exePath}" -silentImport "${nipPath}"`, (error, stdout, stderr) => {
      console.log('stdout:', stdout)
      console.log('stderr:', stderr)
      if (error) {
        console.error('Error:', error)
        reject(error)
      } else {
        resolve(stdout || 'Completed with no output.')
      }
    })
  })
}

export const setupTweaksHandlers = () => {
  ipcMain.handle('tweak-states:load', async () => {
    try {
      await fs.access(tweaksStatePath)
      const data = await fs.readFile(tweaksStatePath, 'utf8')
      return data
    } catch (error) {
      if (error.code === 'ENOENT') {
        return JSON.stringify({})
      }
      console.error('Error loading tweak states:', error)
      throw error
    }
  })

  ipcMain.handle('tweak-states:save', async (event, payload) => {
    try {
      await fs.mkdir(path.dirname(tweaksStatePath), { recursive: true })
      await fs.writeFile(tweaksStatePath, payload, 'utf8')
      return true
    } catch (error) {
      console.error('Error saving tweak states:', error)
      throw error
    }
  })

  ipcMain.handle('tweaks:fetch', async () => {
    return Tweaks.getTweaks()
  })

  ipcMain.handle('tweak:apply', async (_, name) => {
    const tweak = Tweaks.getTweaksFull().find((t) => t.name === name)
    if (!tweak) {
      throw new Error(`No apply script found for tweak: ${name}`)
    }
    if (name === 'optimize-nvidia-settings') {
      console.log(logo, 'Running Nvidia settings optimization...')
      NvidiaProfileInspector()
    } else {
      return runPowerShellScript(tweak.psapply, name)
    }
  })

  ipcMain.handle('tweak:unapply', async (_, name) => {
    const tweak = Tweaks.getTweaksFull().find((t) => t.name === name)
    if (!tweak || !tweak.psunapply) {
      throw new Error(`No unapply script found for tweak: ${name}`)
    }
    return runPowerShellScript(tweak.psunapply, name)
  })

  ipcMain.handle('nvidia-inspector', (_, args) => {
    return NvidiaProfileInspector(args)
  })
}

export const cleanupTweaksHandlers = () => {
  ipcMain.removeHandler('tweak-states:load')
  ipcMain.removeHandler('tweak-states:save')
  ipcMain.removeHandler('tweaks:fetch')
  ipcMain.removeHandler('tweak:apply')
  ipcMain.removeHandler('tweak:unapply')
  ipcMain.removeHandler('nvidia-inspector')
}

export default {
  setupTweaksHandlers,
  cleanupTweaksHandlers
}
