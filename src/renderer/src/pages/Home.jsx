import React, { useState, useEffect } from 'react'
import RootDiv from '@/components/RootDiv'
import { Cpu, HardDrive, Zap, MemoryStick, Server, Monitor } from 'lucide-react'
import { invoke } from '@/lib/electron'
import useTweaksStore from '../store/tweaksStore'
import Button from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import useSystemStore from '@/store/systemInfo'
function Home() {
  const systemInfo = useSystemStore((state) => state.systemInfo)
  const setSystemInfo = useSystemStore((state) => state.setSystemInfo)
  const [tweakInfo, setTweakInfo] = useState(null)
  const router = useNavigate()
  const [loading, setLoading] = useState(true)
  const activeTweaks = useTweaksStore((state) => state.activeTweaks)

  const goToTweaks = () => {
    router('tweaks')
  }

  useEffect(() => {
    async function fetchSystemInfo() {
      if (!systemInfo || Object.keys(systemInfo).length === 0) {
        try {
          const info = await invoke({
            channel: 'get-system-info'
          })
          setSystemInfo(info)

          // console.log('System info:', info)
        } catch (error) {
          console.error('Error fetching system info:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchSystemInfo()
  }, [])
  useEffect(() => {
    async function fetchTweakInfo() {
      try {
        const tweaks = await invoke({
          channel: 'tweaks:fetch'
        })
        setTweakInfo(tweaks)
        // console.log('Fetched tweak info:', tweaks)
      } catch (error) {
        console.error('Error fetching tweak info:', error)
      }
    }

    fetchTweakInfo()
  }, [])
  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return '0 GB'
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  }

  if (loading) {
    return (
      <RootDiv>
        <div className="flex items-center justify-center h-64 flex-col gap-5">
          <div className="text-slate-400">Loading system information...</div>
          <div className="">
            <div
              className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-sparkle-primary rounded-full ml-3"
              role="status"
              aria-label="loading"
            ></div>
          </div>
        </div>
      </RootDiv>
    )
  }

  return (
    <RootDiv>
      <div className="max-w-[1800px] mx-auto ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Cpu className="text-blue-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">CPU</h2>
                <p className="text-slate-400 text-sm">Processor Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">Model</p>
                <p className="text-white font-medium">{systemInfo?.cpu_model || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Cores</p>
                <p className="text-white font-medium">{systemInfo?.cpu_cores || '0'} Cores</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Monitor className="text-green-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">GPU</h2>
                <p className="text-slate-400 text-sm">Graphics Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">Model</p>
                <p className="text-white font-medium">{systemInfo?.gpu_model || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">VRAM</p>
                <p className="text-white font-medium">{systemInfo?.vram || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <MemoryStick className="text-purple-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Memory</h2>
                <p className="text-slate-400 text-sm">RAM Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">Total Memory</p>
                <p className="text-white font-medium">{formatBytes(systemInfo?.memory_total)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Type</p>
                <p className="text-white font-medium">{systemInfo?.memory_type || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-sparkle-primary/10 rounded-lg">
                <Server className="text-sparkle-primary" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">System</h2>
                <p className="text-slate-400 text-sm">OS Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">Operating System</p>
                <p className="text-white font-medium">{systemInfo?.os || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Version</p>
                <p className="text-white font-medium">{systemInfo?.os_version || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <HardDrive className="text-orange-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Storage</h2>
                <p className="text-slate-400 text-sm">Disk Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">Primary Disk</p>
                <p className="text-white font-medium">{systemInfo?.disk_model || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Total Space</p>
                <p className="text-white font-medium">{systemInfo?.disk_size || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Zap className="text-yellow-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Optimizations</h2>
                <p className="text-slate-400 text-sm">System Tweaks Status</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">Available Optimizations</p>
                <p className="text-white font-medium">{tweakInfo?.length || '0'} Optimizations</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Active Optimizations</p>
                <p className="text-white font-medium">{activeTweaks || '0'} Active</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden p-3 w-full mt-5 flex gap-4 items-center ">
          <div className="p-3 bg-yellow-500/10 rounded-lg items-center justify-center text-center ">
            <Zap className="text-yellow-500 " size={18} />
          </div>
          <div>
            <h1 className="font-medium">PC Running slow?</h1>
            <p className="text-slate-400">Try Using Tweaks to improve system performance</p>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => goToTweaks()}
            >
              <Zap size={18} /> Tweaks
            </Button>
          </div>
        </div>
      </div>
    </RootDiv>
  )
}

export default Home
