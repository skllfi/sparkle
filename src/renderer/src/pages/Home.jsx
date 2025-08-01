import { useState, useEffect } from "react"
import RootDiv from "@/components/RootDiv"
import { Cpu, HardDrive, Zap, MemoryStick, Server, Monitor } from "lucide-react"
import { invoke } from "@/lib/electron"
import useTweaksStore from "../store/tweaksStore"
import Button from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import useSystemStore from "@/store/systemInfo"
import log from "electron-log/renderer"
function Home() {
  const systemInfo = useSystemStore((state) => state.systemInfo)
  const setSystemInfo = useSystemStore((state) => state.setSystemInfo)
  const [tweakInfo, setTweakInfo] = useState(() => {
    try {
      const cached = localStorage.getItem("sparkle:tweakInfo")
      return cached ? JSON.parse(cached) : null
    } catch (err) {
      console.error("Failed to parse tweakInfo cache", err)
      return null
    }
  })
  const router = useNavigate()
  const [loading, setLoading] = useState(true)
  const [usingCache, setUsingCache] = useState(false)
  const activeTweaks = useTweaksStore((state) => state.activeTweaks)

  const goToTweaks = () => {
    router("tweaks")
  }

  useEffect(() => {
    const idleHandle = requestIdleCallback(() => {
      const cached = localStorage.getItem("sparkle:systemInfo")
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setSystemInfo(parsed)
          setUsingCache(true)
          setLoading(false)
        } catch (err) {
          console.warn("Failed to parse systemInfo cache", err)
        }
      }

      invoke({ channel: "get-system-info" })
        .then((info) => {
          setSystemInfo(info)
          localStorage.setItem("sparkle:systemInfo", JSON.stringify(info))
          setUsingCache(false)
          log.info("Fetched system info") // logging summary only
        })
        .catch((err) => {
          log.error("Error fetching system info:", err)
          console.error("Error fetching system info:", err)
        })
        .finally(() => setLoading(false))
    })

    return () => cancelIdleCallback(idleHandle)
  }, [])

  useEffect(() => {
    const idleHandle = requestIdleCallback(() => {
      const cached = localStorage.getItem("sparkle:tweakInfo")
      if (cached) {
        try {
          setTweakInfo(JSON.parse(cached))
        } catch (err) {
          console.error("Failed to parse tweakInfo cache", err)
        }
      }

      invoke({ channel: "tweaks:fetch" })
        .then((tweaks) => {
          setTweakInfo(tweaks)
          localStorage.setItem("sparkle:tweakInfo", JSON.stringify(tweaks))
        })
        .catch((err) => {
          console.error("Error fetching tweak info:", err)
        })
    })

    return () => cancelIdleCallback(idleHandle)
  }, [])

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 GB"
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB"
  }

  if (loading) {
    return (
      <RootDiv>
        <div className="flex items-center justify-center h-64 flex-col gap-5">
          <div className="">
            <div
              className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-sparkle-primary rounded-full ml-3"
              role="status"
              aria-label="loading"
            ></div>
          </div>
          <div className="text-sparkle-text-secondary">Loading system information...</div>
          <p className="text-sm text-sparkle-primary">
            You may use other parts of sparkle while this loads
          </p>
        </div>
      </RootDiv>
    )
  }

  return (
    <RootDiv>
      <div className="max-w-[1800px] mx-auto ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Cpu className="text-blue-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sparkle-text mb-1">CPU</h2>
                <p className="text-sparkle-text-secondary text-sm">Processor Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Model</p>
                <p className="text-sparkle-text font-medium">
                  {systemInfo?.cpu_model || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Cores</p>
                <p className="text-sparkle-text font-medium">
                  {systemInfo?.cpu_cores || "0"} Cores
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Monitor className="text-green-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sparkle-text mb-1">GPU</h2>
                <p className="text-sparkle-text-secondary text-sm">Graphics Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Model</p>
                <p className="text-sparkle-text font-medium">
                  {systemInfo?.gpu_model || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">VRAM</p>
                <p className="text-sparkle-text font-medium">{systemInfo?.vram || "Unknown"}</p>
              </div>
            </div>
          </div>

          <div className="bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <MemoryStick className="text-purple-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sparkle-text mb-1">Memory</h2>
                <p className="text-sparkle-text-secondary text-sm">RAM Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Total Memory</p>
                <p className="text-sparkle-text font-medium">
                  {formatBytes(systemInfo?.memory_total)}
                </p>
              </div>
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Type</p>
                <p className="text-sparkle-text font-medium">
                  {systemInfo?.memory_type || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Server className="text-red-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sparkle-text mb-1">System</h2>
                <p className="text-sparkle-text-secondary text-sm">OS Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Operating System</p>
                <p className="text-sparkle-text font-medium">{systemInfo?.os || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Version</p>
                <p className="text-sparkle-text font-medium">
                  {systemInfo?.os_version || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <HardDrive className="text-orange-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sparkle-text mb-1">Storage</h2>
                <p className="text-sparkle-text-secondary text-sm">Disk Information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Primary Disk</p>
                <p className="text-sparkle-text font-medium">
                  {systemInfo?.disk_model || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Total Space</p>
                <p className="text-sparkle-text font-medium">
                  {systemInfo?.disk_size || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Zap className="text-yellow-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sparkle-text mb-1">Tweaks</h2>
                <p className="text-sparkle-text-secondary text-sm">System Tweaks Status</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Available Tweaks</p>
                <p className="text-sparkle-text font-medium">{tweakInfo?.length || "0"} Tweaks</p>
              </div>
              <div>
                <p className="text-sparkle-text-secondary text-xs mb-1">Active Tweaks</p>
                <p className="text-sparkle-text font-medium">{activeTweaks || "0"} Active</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-3 w-full mt-5 flex gap-4 items-center ">
          <div className="p-3 bg-yellow-500/10 rounded-lg items-center justify-center text-center ">
            <Zap className="text-yellow-500 " size={18} />
          </div>
          <div>
            <h1 className="font-medium text-sparkle-text">PC Running slow?</h1>
            <p className="text-sparkle-text-secondary">
              Try Using Tweaks to improve system performance
            </p>
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
        <p className="text-xs text-sparkle-text-secondary text-center mt-4">
          {usingCache ? "Loading latest system data..." : ""}
        </p>
      </div>
    </RootDiv>
  )
}

export default Home
