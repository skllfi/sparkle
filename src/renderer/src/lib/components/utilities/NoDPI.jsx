import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import Card from "@/components/ui/card.jsx";
import Button from "@/components/ui/button.jsx";
import Toggle from "@/components/ui/toggle.jsx";
import Modal from "@/components/ui/modal.jsx";

export default function NoDPIComponent() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("inactive");
  const [autostart, setAutostart] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [blacklistContent, setBlacklistContent] = useState("");
  const [stats, setStats] = useState({
    conns: "0",
    unblock: "0",
    errors: "0",
    traffic: "0 GB",
    speed_dl: "0 KB/s",
    speed_ul: "0 KB/s",
  });

  useEffect(() => {
    const checkInitialStatus = async () => {
      const isRunning = await window.api.checkNoDPIStatus();
      setStatus(isRunning ? "active" : "inactive");
      const isAutostart = await window.api.isNoDPIAutostartEnabled();
      setAutostart(isAutostart);
    };

    checkInitialStatus();

    const cleanupListener = window.api.onNoDPIOutput((line) => {
      setStats((prevStats) => {
        let newStats = { ...prevStats };
        if (line.includes("Conns")) {
          const connsMatch = line.match(/Total: (\d+)/);
          const unblockMatch = line.match(/Unblock: (\d+)/);
          const errorsMatch = line.match(/Errors: (\d+)/);
          if (connsMatch) newStats.conns = connsMatch[1];
          if (unblockMatch) newStats.unblock = unblockMatch[1];
          if (errorsMatch) newStats.errors = errorsMatch[1];
        } else if (line.includes("Traffic")) {
          const trafficMatch = line.match(/Total: ([\d.]+\s\w+)/);
          if (trafficMatch) newStats.traffic = trafficMatch[1];
        } else if (line.includes("Speed")) {
          const speedDLMatch = line.match(/DL: ([\d.]+\s\w+\/s)/);
          const speedULMatch = line.match(/UL: ([\d.]+\s\w+\/s)/);
          if (speedDLMatch) newStats.speed_dl = speedDLMatch[1];
          if (speedULMatch) newStats.speed_ul = speedULMatch[1];
        }
        return newStats;
      });
    });

    return () => {
      if (cleanupListener) {
        cleanupListener();
      }
    };
  }, []);

  const toggleNoDPI = async () => {
    if (status === "inactive") {
      await window.api.startNoDPI();
      setStatus("active");
    } else {
      await window.api.stopNoDPI();
      setStatus("inactive");
    }
  };

  const toggleAutostart = async () => {
    if (autostart) {
      await window.api.disableNoDPIAutostart();
      setAutostart(false);
    } else {
      await window.api.enableNoDPIAutostart();
      setAutostart(true);
    }
  };

  const openEditModal = async () => {
    const content = await window.api.getNoDPIBlacklist();
    setBlacklistContent(content);
    setShowModal(true);
  };

  const saveBlacklist = async () => {
    await window.api.updateNoDPIBlacklist(blacklistContent);
    setShowModal(false);
  };

  return (
    <>
      <Card className="mb-4">
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold">
            {t("utilities.nodpi_title")}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {t("utilities.nodpi_description")}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400">
                {t("utilities.nodpi_status_label")}
              </div>
              <div
                className={`font-semibold ${status === "active" ? "text-green-400" : "text-red-400"}`}
              >
                {status === "active"
                  ? t("utilities.nodpi_status_active")
                  : t("utilities.nodpi_status_inactive")}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Toggle checked={autostart} onCheckedChange={toggleAutostart} />
              <span className="text-sm">
                {t("utilities.nodpi_autostart_label")}
              </span>
            </div>
          </div>

          {status === "active" && (
            <div className="bg-gray-800 p-3 rounded-lg mb-4 text-xs">
              <h4 className="font-semibold mb-2">
                {t("utilities.nodpi_stats_title")}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <strong>{t("utilities.nodpi_stats_conns")}:</strong>{" "}
                  {stats.conns}
                </div>
                <div>
                  <strong>{t("utilities.nodpi_stats_unblock")}:</strong>{" "}
                  {stats.unblock}
                </div>
                <div>
                  <strong>{t("utilities.nodpi_stats_errors")}:</strong>{" "}
                  {stats.errors}
                </div>
                <div>
                  <strong>{t("utilities.nodpi_stats_traffic")}:</strong>{" "}
                  {stats.traffic}
                </div>
                <div className="col-span-2">
                  <strong>{t("utilities.nodpi_stats_speed")} (DL/UL):</strong>{" "}
                  {stats.speed_dl} / {stats.speed_ul}
                </div>
              </div>
            </div>
          )}

          <div className="flex-grow"></div>

          <div className="flex space-x-2">
            <Button onClick={toggleNoDPI} className="flex-1">
              {status === "inactive"
                ? t("utilities.nodpi_run")
                : t("utilities.nodpi_stop")}
            </Button>
            <Button onClick={openEditModal} variant="secondary">
              {t("utilities.nodpi_edit_domains_button")}
            </Button>
          </div>
        </div>
      </Card>

      {showModal && (
        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-sparkle-card p-6 rounded-2xl border border-sparkle-border text-sparkle-text w-[90vw] max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {t("utilities.nodpi_edit_domains_title")}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              {t("utilities.nodpi_edit_domains_description")}
            </p>
            <textarea
              value={blacklistContent}
              onChange={(e) => setBlacklistContent(e.target.value)}
              className="w-full h-64 bg-gray-900 text-white p-2 rounded border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            ></textarea>
            <div className="flex justify-end mt-4">
              <Button onClick={saveBlacklist}>{t("save")}</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
