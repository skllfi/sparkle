import os from 'os'
import { ipcMain } from 'electron'
import si from 'systeminformation'
import { exec } from 'child_process'

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

ipcMain.handle('restart', restartSystem)

ipcMain.handle('get-system-info', getSystemInfo)
