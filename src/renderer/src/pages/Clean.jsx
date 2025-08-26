import Button from "@/components/ui/button"
import { useState } from "react"
import { invoke } from "@/lib/electron"
import RootDiv from "@/components/RootDiv"
import { RefreshCw, Icon } from "lucide-react"
import { broom } from "@lucide/lab"
import { toast } from "react-toastify"
import log from "electron-log/renderer"

const cleanups = [
  {
    id: "temp",
    label: "Clean Temporary Files",
    description: "Remove system and user temporary files.",
    script: `
      $systemTemp = "$env:SystemRoot\\Temp"
      $userTemp = [System.IO.Path]::GetTempPath()
      $foldersToClean = @($systemTemp, $userTemp)
      foreach ($folder in $foldersToClean) {
          if (Test-Path $folder) {
              Get-ChildItem -Path $folder -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
          }
      }
    `,
  },
  {
    id: "prefetch",
    label: "Clean Prefetch Files",
    description: "Delete files from the Windows Prefetch folder.",
    script: `
      $prefetch = "$env:SystemRoot\\Prefetch"
      if (Test-Path $prefetch) {
          Remove-Item "$prefetch\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
    `,
  },
  {
    id: "recyclebin",
    label: "Empty Recycle Bin",
    description: "Permanently remove files from the Recycle Bin.",
    script: `Clear-RecycleBin -Force -ErrorAction SilentlyContinue`,
  },
  {
    id: "windows-update",
    label: "Clean Windows Update Cache",
    description: "Remove Windows Update downloaded installation files.",
    script: `
      $windowsUpdateDownload = "$env:SystemRoot\\SoftwareDistribution\\Download"
      if (Test-Path $windowsUpdateDownload) {
          Remove-Item "$windowsUpdateDownload\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
    `,
  },
]

function Clean() {
  const [loadingId, setLoadingId] = useState(null)
  const [lastClean, setLastClean] = useState(
    localStorage.getItem("last-clean") || "Not cleaned yet.",
  )

  async function runCleanup(id, script) {
    try {
      setLoadingId(id)
      const toastId = toast.loading(`Running ${id} cleanup...`)
      await invoke({
        channel: "run-powershell",
        payload: { script, name: `cleanup-${id}` },
      })
      toast.update(toastId, {
        render: `${id.charAt(0).toUpperCase() + id.slice(1)} cleanup completed!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
      const now = new Date().toLocaleString()
      setLastClean(now)
      localStorage.setItem("last-clean", now)
    } catch (err) {
      toast.update(toastId, {
        render: `Failed to run ${id} cleanup: ${err.message || err}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      })
      log.error(`Failed to run ${id} cleanup: ${err.message || err}`)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <RootDiv>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4 p-6 rounded-2xl border border-sparkle-border bg-sparkle-card backdrop-blur-sm">
          <div className="flex items-center justify-center p-3 rounded-xl">
            <Icon iconNode={broom} className="text-green-500" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-sparkle-text mb-1">System Cleanup</h2>
            <p className="text-sm text-sparkle-text-secondary">
              Last cleaned: <span className="font-medium">{lastClean}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cleanups.map(({ id, label, description, script }) => (
            <div
              key={id}
              className="relative group p-6 rounded-xl border border-sparkle-border bg-sparkle-card"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-sparkle-text mb-2">{label}</h3>
                <p className="text-sm text-sparkle-text-secondary">{description}</p>
              </div>

              <Button
                onClick={() => runCleanup(id, script)}
                disabled={loadingId !== null}
                className="w-full flex items-center justify-center gap-2"
              >
                {loadingId === id ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Cleaning...</span>
                  </>
                ) : (
                  <>
                    <Icon iconNode={broom} size={18} />
                    <span>Run Cleanup</span>
                  </>
                )}
              </Button>
              {loadingId === id && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sparkle-card">
                    <RefreshCw className="animate-spin" size={18} />
                    <span className="text-sm font-medium">Running cleanup...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </RootDiv>
  )
}

export default Clean
