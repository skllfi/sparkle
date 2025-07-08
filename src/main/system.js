import os from 'os'
import { ipcMain } from 'electron'
import si from 'systeminformation'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

async function getSystemInfo() {
  try {
    const [cpuData, graphicsData, osInfo, memLayout, diskLayout] = await Promise.all([
      si.cpu(),
      si.graphics(),
      si.osInfo(),
      si.memLayout(),
      si.diskLayout()
    ])

    let totalMemory = os.totalmem()
    const memoryType = memLayout.length > 0 ? memLayout[0].type : 'Unknown'

    const primaryDisk = diskLayout.length > 0 ? diskLayout[0] : null

    let gpuInfo = { model: 'GPU not found', vram: 'N/A' }

    if (graphicsData.controllers && graphicsData.controllers.length > 0) {
      const dedicatedGPU = graphicsData.controllers.find((controller) => {
        const model = (controller.model || '').toLowerCase()
        return (
          model.includes('nvidia') ||
          model.includes('amd') ||
          model.includes('radeon') ||
          model.includes('intel')
        )
      })

      const gpu = dedicatedGPU || graphicsData.controllers[0]

      if (gpu) {
        gpuInfo = {
          model: gpu.model || 'Unknown GPU',
          vram: gpu.vram ? `${Math.round(gpu.vram / 1024)} GB` : 'Unknown'
        }
      }
    }

    return {
      cpu_model: cpuData.brand,
      cpu_cores: cpuData.cores,
      cpu_threads: cpuData.threads,

      gpu_model: gpuInfo.model,
      vram: gpuInfo.vram,

      memory_total: totalMemory,
      memory_type: memoryType,

      os: osInfo.distro || 'Windows',
      os_version: osInfo.release || 'Unknown',

      disk_model: primaryDisk?.name || 'Unknown Storage',
      disk_size: primaryDisk?.size
        ? `${Math.round(primaryDisk.size / 1024 / 1024 / 1024)} GB`
        : 'Unknown',

      total_optimizations: 13
    }
  } catch (error) {
    console.error('Failed to get system info:', error)
    throw error
  }
}

function restartSystem() {
  try {
    exec('shutdown /r /t 0')
    return { success: true }
  } catch (error) {
    console.error('Failed to restart system:', error)
    throw error
  }
}

function clearSparkleCache() {
  try {
    const scriptsPath = path.join(
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
      'sparkle',
      'scripts'
    )
    if (fs.existsSync(scriptsPath)) {
      const files = fs.readdirSync(scriptsPath)
      for (const file of files) {
        const filePath = path.join(scriptsPath, file)
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        }
      }
      console.log('Sparkle scripts directory files cleared successfully.')
      return { success: true }
    } else {
      console.warn('Sparkle scripts directory does not exist.')
      return { success: false, error: 'Scripts directory does not exist.' }
    }
  } catch (error) {
    console.error('Failed to clear Sparkle scripts directory:', error)
    return { success: false, error: error.message }
  }
}

ipcMain.handle('restart', restartSystem)
ipcMain.handle('clear-sparkle-cache', clearSparkleCache)
ipcMain.handle('get-system-info', getSystemInfo)
