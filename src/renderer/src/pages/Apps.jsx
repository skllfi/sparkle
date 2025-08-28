import { useState, useMemo } from "react"
import data from "../assets/apps.json"
import RootDiv from "@/components/RootDiv"
import { Search } from "lucide-react"
import Button from "@/components/ui/button"
import Checkbox from "@/components/ui/Checkbox"
import Modal from "@/components/ui/modal"
import { invoke } from "@/lib/electron"
import { Download } from "lucide-react"
import { Trash } from "lucide-react"
import { toast } from "react-toastify"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import log from "electron-log/renderer"
function Apps() {
  const [search, setSearch] = useState("")
  const [selectedApps, setSelectedApps] = useState([])
  const [loading, setLoading] = useState("")
  const [currentApp, setCurrentApp] = useState("")
  const [installedApps, setInstalledApps] = useState([])

  const appsList = data.apps
  const router = useNavigate()

  const filteredApps = appsList.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase()),
  )

  const appsByCategory = useMemo(() => {
    return filteredApps.reduce((acc, app) => {
      if (!acc[app.category]) acc[app.category] = []
      acc[app.category].push(app)
      return acc
    }, {})
  }, [filteredApps])

  const checkInstalledApps = () => {
    invoke({
      channel: "handle-apps",
      payload: {
        action: "check-installed",
        apps: appsList.map((a) => a.id),
      },
    })
  }
  const toggleApp = (appId) => {
    setSelectedApps((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId],
    )
  }

  useEffect(() => {
    const idleHandle = requestIdleCallback(() => {
      try {
        const item = window.localStorage.getItem("installedApps")
        if (item) {
          setInstalledApps(JSON.parse(item))
        }
      } catch (error) {
        console.error("Failed to parse installedApps from localStorage", error)
      }
    })

    checkInstalledApps()

    const listeners = {
      "install-progress": (event, message) => {
        console.log(message)
        setCurrentApp(message)
      },
      "install-complete": () => {
        setLoading("")
        setCurrentApp("")
        toast.success("Operation completed successfully!")
        checkInstalledApps()
      },
      "install-error": () => {
        setLoading("")
        setCurrentApp("")
        toast.error("There was an error during the operation. Please try again.")
      },
      "installed-apps-checked": (event, { success, installed, error }) => {
        if (success) {
          setInstalledApps(installed)
          try {
            window.localStorage.setItem("installedApps", JSON.stringify(installed))
          } catch (err) {
            console.error("Failed to save installed apps to localStorage", err)
          }
        } else {
          console.error("Failed to check installed apps:", error)
          toast.error("Could not verify installed apps.")
        }
      },
    }

    Object.entries(listeners).forEach(([channel, listener]) => {
      window.electron.ipcRenderer.on(channel, listener)
    })

    return () => {
      cancelIdleCallback(idleHandle)
      Object.keys(listeners).forEach((channel) => {
        window.electron.ipcRenderer.removeAllListeners(channel)
      })
    }
  }, [])

  const handleAppAction = async (type) => {
    const actionVerb = type === "install" ? "Installing" : "Uninstalling"
    setLoading(type)

    try {
      const commands = selectedApps.flatMap((appId) => {
        const app = appsList.find(
          (a) => a.id === appId || (Array.isArray(a.id) && a.id.includes(appId)),
        )
        return app
      })
      console.log(commands)
      invoke({
        channel: "handle-apps",
        payload: {
          action: type,
          apps: selectedApps,
        },
      })

      if (commands.length === 0) return
    } catch (error) {
      console.error(`Error ${actionVerb.toLowerCase()} apps:`, error)
      log.error(`Error ${actionVerb.toLowerCase()} apps:`, error)
    }
  }

  return (
    <>
      <Modal open={!!loading} onClose={() => {}}>
        <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-sparkle-primary/30 rounded-full animate-spin border-t-sparkle-primary border-sparkle-accent"></div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-sparkle-text">
                {loading === "install" ? "Installing" : "Uninstalling"} {currentApp || "Apps"}
              </h3>
              <p className="text-sm text-sparkle-text-secondary">This may take a few moments</p>
            </div>
          </div>
        </div>
      </Modal>
      <RootDiv>
        <div className="flex items-center gap-3 bg-sparkle-card border border-sparkle-border rounded-xl px-4 backdrop-blur-sm ml-1 mr-1">
          <Search className="text-sparkle-text-secondary" />
          <input
            type="text"
            placeholder="Search for apps..."
            className="w-full py-3 px-0 bg-transparent border-none focus:outline-none focus:ring-0 text-sparkle-text placeholder:text-sparkle-text-secondary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-5 w-auto ml-1 mr-1">
          <Button
            className="text-sparkle-text flex gap-2"
            disabled={selectedApps.length === 0 || loading}
            onClick={() => handleAppAction("install")}
          >
            <Download className="w-5" />
            Install Selected
          </Button>
          <Button
            className="flex gap-2"
            variant="danger"
            disabled={selectedApps.length === 0 || loading}
            onClick={() => handleAppAction("uninstall")}
          >
            <Trash className="w-5" />
            Uninstall Selected
          </Button>
          {selectedApps.length > 0 && (
            <Button
              className="flex gap-2 ml-auto bg-sparkle-border text-sparkle-text"
              variant="ghost"
              onClick={() => setSelectedApps([])}
            >
              Uncheck All
            </Button>
          )}
        </div>
        <p className="mb-5 mt-2 text-sparkle-text-muted font-medium">
          Looking to debloat windows? its located in {""}
          <a className="text-sparkle-primary cursor-pointer" onClick={() => router("/tweaks")}>
            Tweaks
          </a>
        </p>
        <div className="space-y-10 mb-10">
          {Object.entries(appsByCategory).map(([category, apps]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl text-sparkle-primary font-bold capitalize">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-sparkle-card border border-sparkle-border rounded-lg p-4 hover:border-sparkle-primary transition group cursor-pointer"
                    onClick={() => toggleApp(app.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          onClick={(e) => e.stopPropagation()} // Prevent double toggle when checkbox is clicked
                        >
                          <Checkbox
                            checked={selectedApps.includes(app.id)}
                            onChange={() => toggleApp(app.id)}
                          />
                        </div>
                        <div>
                          <h3 className="text-sparkle-text font-medium group-hover:text-sparkle-primary transition">
                            {app.name}
                          </h3>
                          {app.info && (
                            <p className="text-sm text-sparkle-text-secondary line-clamp-1 font-semibold">
                              {app.info}
                            </p>
                          )}
                          <p className="text-xs text-sparkle-text-secondary">ID: {app.id}</p>
                        </div>
                      </div>
                      {installedApps.includes(app.id) && (
                        <div className="text-xs font-semibold text-sparkle-text bg-sparkle-accent py-1 px-2 rounded-full">
                          Installed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-center text-sparkle-text-muted">
            Request more apps or make a pull request on{" "}
            <a
              href="https://github.com/parcoil/sparkle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sparkle-primary"
            >
              github
            </a>
          </p>
        </div>
      </RootDiv>
    </>
  )
}

export default Apps
