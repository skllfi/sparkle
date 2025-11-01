import {
  useState,
  useMemo,
  Suspense,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";
import data from "../assets/apps.json";
import RootDiv from "@/components/rootdiv";
import { Search, Download, Trash, Upload } from "lucide-react";
import Button from "@/components/ui/button.jsx";
import Checkbox from "@/components/ui/checkbox.jsx";
import Modal from "@/components/ui/modal.jsx";
import { invoke } from "@/lib/electron";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import log from "electron-log/renderer";
import Card from "@/components/ui/card.jsx";
import { LargeInput } from "@/components/ui/input.jsx";
import sparkleLogo from "@/assets/icon.png";

interface App {
  id: string | string[];
  name: string;
  category: string;
  icon?: string;
  info?: string;
}

function Apps() {
  const [search, setSearch] = useState("");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [loading, setLoading] = useState("");
  const [currentApp, setCurrentApp] = useState("");
  const [totalApps, setTotalApps] = useState(0);
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedApps, setImportedApps] = useState<string[]>([]);
  const [selectedImportedApps, setSelectedImportedApps] =
    useState<string[]>(importedApps);
  const [appsList, setAppsList] = useState<App[]>([]);

  const router = useNavigate();

  const filteredApps = appsList.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase()),
  );

  const exportSelectedApps = () => {
    const blob = new Blob([JSON.stringify(selectedApps, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sparkle-apps.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSelectedApps = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== "string") return;
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
          setImportedApps(parsed);
          setSelectedImportedApps(parsed);
          setImportModalOpen(true);
        } else {
          toast.error("Invalid import file format");
        }
      } catch {
        toast.error("Failed to parse JSON file");
      } finally {
        if (event.target) event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const appsByCategory = useMemo(() => {
    return filteredApps.reduce(
      (acc, app) => {
        if (!acc[app.category]) acc[app.category] = [];
        acc[app.category].push(app);
        return acc;
      },
      {} as Record<string, App[]>,
    );
  }, [filteredApps]);

  const checkInstalledApps = useCallback(() => {
    invoke({
      channel: "handle-apps",
      payload: {
        action: "check-installed",
        apps: appsList.map((a) => a.id),
      },
    });
  }, [appsList]);

  const toggleApp = (appId: string | string[]) => {
    const id = Array.isArray(appId) ? appId[0] : appId;
    setSelectedApps((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const loadApps = async () => {
      try {
        let appsData: { apps: App[] };
        if (import.meta.env.DEV) {
          appsData = data;
        } else {
          const response = await fetch(
            "https://raw.githubusercontent.com/parcoil/sparkle/refs/heads/v2/src/renderer/src/assets/apps.json",
          );
          appsData = await response.json();
        }
        setAppsList(appsData.apps || []);
      } catch (error) {
        console.error("Failed to load apps list", error);
        toast.error("Failed to fetch apps list (Using local apps.json)");
        setAppsList(data.apps || []);
      }
    };

    loadApps();

    const idleHandle = requestIdleCallback(() => {
      try {
        const item = window.localStorage.getItem("installedApps");
        if (item) {
          setInstalledApps(JSON.parse(item));
        }
      } catch (error) {
        console.error("Failed to parse installedApps from localStorage", error);
      }
    });

    checkInstalledApps();

    const listeners = {
      "install-progress": (event: any, message: string) => {
        console.log(message);
        setCurrentApp(message);
        setCurrentIndex((prev) => prev + 1);
      },
      "install-complete": () => {
        setLoading("");
        setCurrentApp("");
        setCurrentIndex(0);
        setTotalApps(0);
        toast.success("Operation completed successfully!");
        checkInstalledApps();
      },
      "install-error": () => {
        setLoading("");
        setCurrentApp("");
        toast.error(
          "There was an error during the operation. Please try again.",
        );
      },
      "installed-apps-checked": (
        event: any,
        {
          success,
          installed,
          error,
        }: { success: boolean; installed: string[]; error: any },
      ) => {
        if (success) {
          setInstalledApps(installed);
          try {
            window.localStorage.setItem(
              "installedApps",
              JSON.stringify(installed),
            );
          } catch (err) {
            console.error("Failed to save installed apps to localStorage", err);
          }
        } else {
          console.error("Failed to check installed apps:", error);
          toast.error("Could not verify installed apps.");
        }
      },
    };

    Object.entries(listeners).forEach(([channel, listener]) => {
      window.electron.ipcRenderer.on(channel, listener as any);
    });

    return () => {
      cancelIdleCallback(idleHandle);
      Object.keys(listeners).forEach((channel) => {
        window.electron.ipcRenderer.removeAllListeners(channel);
      });
    };
  }, [checkInstalledApps]);

  const handleAppAction = async (
    type: "install" | "uninstall",
    appsToUse = selectedApps,
  ) => {
    const actionVerb = type === "install" ? "Installing" : "Uninstalling";
    setLoading(type);

    try {
      const commands = appsToUse.flatMap((appId) => {
        const app = appsList.find(
          (a) =>
            a.id === appId || (Array.isArray(a.id) && a.id.includes(appId)),
        );
        return app;
      });

      if (commands.length === 0) return;

      invoke({
        channel: "handle-apps",
        payload: {
          action: type,
          apps: appsToUse,
        },
      });

      setTotalApps(appsToUse.length);
      setCurrentIndex(0);
    } catch (error) {
      console.error(`Error ${actionVerb.toLowerCase()} apps:`, error);
      log.error(`Error ${actionVerb.toLowerCase()} apps:`, error);
    }
  };

  return (
    <>
      <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)}>
        <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4">
          <h3 className="text-xl font-semibold text-sparkle-text mb-3">
            Import Apps ({importedApps.length})
          </h3>

          <div className="text-sparkle-text-secondary text-sm leading-6 whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar mb-6">
            {importedApps.length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {importedApps.map((id) => {
                  const app = appsList.find((a) => a.id === id);
                  return (
                    <li
                      key={id}
                      className="flex items-center gap-2 text-sparkle-text"
                    >
                      <Checkbox
                        checked={selectedImportedApps.includes(id)}
                        onChange={(checked: boolean) => {
                          setSelectedImportedApps((prev) => {
                            if (checked) {
                              return prev.includes(id) ? prev : [...prev, id];
                            } else {
                              return prev.filter((x) => x !== id);
                            }
                          });
                        }}
                        label=""
                      />

                      {app ? app.name : `Unknown App (${id})`}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sparkle-text-secondary italic">
                No apps found in file
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={selectedImportedApps.length === 0}
              onClick={() => {
                setSelectedApps(selectedImportedApps);
                setImportModalOpen(false);
                handleAppAction("install", selectedImportedApps);
              }}
            >
              Install Selected
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!loading} onClose={() => {}}>
        <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-sparkle-primary/30 rounded-full animate-spin border-t-sparkle-primary border-sparkle-accent"></div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-sparkle-text">
                {loading === "install" ? "Installing" : "Uninstalling"}{" "}
                {currentApp || "Apps"}
                <p className="text-sm text-sparkle-text-secondary  mt-1 mb-1">
                  {totalApps > 0 && ` (${currentIndex} of ${totalApps})`}
                </p>
              </h3>
              <p className="text-sm text-sparkle-text-secondary">
                This may take a few moments
              </p>
            </div>
          </div>
        </div>
      </Modal>
      <RootDiv>
        <LargeInput
          type="text"
          icon={Search}
          placeholder={`Search for ${appsList.length} apps...`}
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />

        <div className="flex gap-3 mt-5 w-auto ml-1 mr-1">
          <Button
            className="text-sparkle-text flex gap-2"
            disabled={selectedApps.length === 0 || !!loading}
            onClick={() => handleAppAction("install")}
          >
            <Download className="w-5" />
            Install Selected
          </Button>
          <Button
            className="flex gap-2"
            variant="danger"
            disabled={selectedApps.length === 0 || !!loading}
            onClick={() => handleAppAction("uninstall")}
          >
            <Trash className="w-5" />
            Uninstall Selected
          </Button>
          <Button
            className="flex gap-2"
            onClick={exportSelectedApps}
            disabled={selectedApps.length === 0}
          >
            <Download className="w-5" />
            Export List
          </Button>

          <label className="flex gap-2 cursor-pointer bg-sparkle-border text-sparkle-text rounded-lg font-medium px-3 py-1.5 text-sm text-center items-center active:scale-90 hover:bg-sparkle-secondary transition-all duration-200">
            <Upload className="w-5" />
            Import List
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importSelectedApps}
            />
          </label>

          {selectedApps.length > 0 && (
            <Button
              className="flex gap-2 ml-auto bg-sparkle-border text-sparkle-text"
              variant="secondary"
              onClick={() => setSelectedApps([])}
            >
              Uncheck All
            </Button>
          )}
        </div>
        <p className="mb-2 mt-2 text-sparkle-text-muted font-medium">
          Looking to debloat windows? its located in {""}
          <a
            className="text-sparkle-primary cursor-pointer"
            onClick={() => router("/tweaks")}
          >
            Tweaks
          </a>
        </p>
        {import.meta.env.DEV && (
          <p className=" text-red-500 font-medium">
            You are in development mode, using local apps.json
          </p>
        )}
        <div className="space-y-10 mb-10">
          <Suspense
            fallback={
              <div className="text-center text-sparkle-text-secondary">
                Loading...
              </div>
            }
          >
            {Object.entries(appsByCategory).map(([category, apps]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl text-sparkle-primary font-bold capitalize">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 mr-4">
                  {apps.map((app) => (
                    <Card
                      key={app.id.toString()}
                      onClick={() => toggleApp(app.id)}
                      className="p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              label=""
                              checked={selectedApps.includes(
                                Array.isArray(app.id) ? app.id[0] : app.id,
                              )}
                              onChange={() => toggleApp(app.id)}
                            />
                          </div>
                          <div className="min-w-10 max-w-10 max--h-10 min-h-10 rounded-lg overflow-hidden bg-sparkle-accent flex items-center justify-center">
                            {app.icon ? (
                              <img
                                src={app.icon}
                                alt={app.name}
                                className="w-8 h-8 object-contain rounded-md"
                              />
                            ) : (
                              <img
                                src={sparkleLogo}
                                alt=""
                                className="w-6 h-6 opacity-50"
                              />
                            )}
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
                            <p className="text-xs text-sparkle-text-secondary">
                              ID:{" "}
                              {Array.isArray(app.id)
                                ? app.id.join(", ")
                                : app.id}
                            </p>
                          </div>
                        </div>
                        {installedApps.includes(
                          Array.isArray(app.id) ? app.id[0] : app.id,
                        ) && (
                          <div className="text-xs font-semibold text-sparkle-text bg-sparkle-accent py-1 px-2 rounded-full">
                            Installed
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </Suspense>
          <p className="text-center text-sparkle-text-muted">
            Request more apps or make a pull request on {""}
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
  );
}

export default Apps;
