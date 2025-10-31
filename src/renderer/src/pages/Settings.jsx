import RootDiv from "@/components/rootdiv.jsx";
import { useEffect, useState } from "react";
import jsonData from "../../../../package.json";
import { invoke } from "@/lib/electron";
import Button from "@/components/ui/button.jsx";
import Modal from "@/components/ui/modal.jsx";
import Toggle from "@/components/ui/toggle.jsx";
import { toast } from "react-toastify";
import Card from "@/components/ui/card.jsx";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";

const themes = [
  { labelKey: "settings.themes.system", value: "system" },
  { labelKey: "settings.themes.dark", value: "dark" },
  { labelKey: "settings.themes.light", value: "light" },
  { labelKey: "settings.themes.purple", value: "purple" },
  { labelKey: "settings.themes.gray", value: "gray" },
  { labelKey: "settings.themes.classic", value: "classic" },
];

const languages = [
  { label: "English", value: "en" },
  { label: "Russian", value: "ru" },
];

function Settings() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en",
  );
  const [checking, setChecking] = useState(false);
  const [discordEnabled, setDiscordEnabled] = useState(true);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [trayEnabled, setTrayEnabled] = useState(true);
  const [trayLoading, setTrayLoading] = useState(false);
  const [posthogDisabled, setPosthogDisabled] = useState(() => {
    return localStorage.getItem("posthogDisabled") === "true";
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const checkForUpdates = async () => {
    try {
      setChecking(true);
      const res = await invoke({ channel: "updater:check" });
      if (res?.ok && !res.updateInfo) {
        toast.success(t("settings.up_to_date"));
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    document.body.classList.remove(
      "light",
      "purple",
      "dark",
      "gray",
      "classic",
    );
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.body.classList.add(systemTheme);
    } else if (theme) {
      document.body.classList.add(theme);
    } else {
      document.body.classList.add("dark");
    }
    localStorage.setItem("theme", theme || "dark");
  }, [theme]);

  useEffect(() => {
    invoke({ channel: "discord-rpc:get" }).then((status) =>
      setDiscordEnabled(status),
    );
    invoke({ channel: "tray:get" }).then((status) => setTrayEnabled(status));
  }, []);

  useEffect(() => {
    if (posthogDisabled) {
      document.body.classList.add("ph-no-capture");
    } else {
      document.body.classList.remove("ph-no-capture");
    }
    localStorage.setItem("posthogDisabled", posthogDisabled);
  }, [posthogDisabled]);

  const handleToggleDiscord = async () => {
    setDiscordLoading(true);
    const newStatus = !discordEnabled;
    await invoke({ channel: "discord-rpc:toggle", payload: newStatus });
    setDiscordEnabled(newStatus);
    setDiscordLoading(false);
  };

  const clearCache = async () => {
    await invoke({ channel: "clear-sparkle-cache" });
    localStorage.removeItem("sparkle:systemInfo");
    localStorage.removeItem("sparkle:tweakInfo");
    toast.success(t("settings.cache_cleared_success"));
  };

  const handleToggleTray = async () => {
    setTrayLoading(true);
    const newStatus = !trayEnabled;
    await invoke({ channel: "tray:set", payload: newStatus });
    setTrayEnabled(newStatus);
    setTrayLoading(false);
  };

  return (
    <>
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-3">
              {t("settings.delete_legacy_backups_title")}
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t("settings.delete_legacy_backups_confirm")}
              <code className="bg-sparkle-border-secondary/20 px-1 py-0.5 rounded-sm text-xs">
                C:\Sparkle\Backup
              </code>
              {t("settings.folder_and_contents")}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              {t("settings.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDeleteModalOpen(false);
                invoke({ channel: "delete-old-sparkle-backups" });
              }}
            >
              {t("settings.delete")}
            </Button>
          </div>
        </div>
      </Modal>
      <RootDiv>
        <div className="min-h-screen w-full pb-16 overflow-y-auto">
          <div className="space-y-8 ">
            <SettingSection title={t("settings.appearance_title")}>
              <SettingCard>
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-sparkle-text">
                    {t("settings.language_title")}
                  </h3>
                  <p className="text-sm text-sparkle-text-secondary">
                    {t("settings.language_description")}
                  </p>
                  <div className="flex gap-2">
                    <select
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="w-full bg-sparkle-card border border-sparkle-border rounded-lg px-3 py-2 text-sparkle-text focus:ring-0 focus:outline-hidden"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </SettingCard>
              <SettingCard>
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-sparkle-text">
                    {t("settings.theme_title")}
                  </h3>
                  <div className="grid grid-cols-6 gap-3">
                    {themes.map((themeOption) => (
                      <label
                        key={themeOption.value}
                        className={`flex items-center justify-center gap-2 cursor-pointer p-3 rounded-lg border transition-all duration-200 active:scale-95 ${
                          theme === themeOption.value
                            ? "border-sparkle-primary"
                            : "border-sparkle-border"
                        }`}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={themeOption.value}
                          checked={theme === themeOption.value}
                          onChange={() => setTheme(themeOption.value)}
                          className="sr-only"
                        />
                        <span className="text-sparkle-text font-medium">
                          {t(themeOption.labelKey)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </SettingCard>
            </SettingSection>

            <SettingSection title={t("settings.discord_rpc_title")}>
              <SettingCard>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-sparkle-text mb-1">
                      {t("settings.discord_rpc_title")}
                    </h3>
                    <p className="text-sm text-sparkle-text-secondary">
                      {t("settings.discord_rpc_description")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={discordEnabled}
                      onChange={handleToggleDiscord}
                      disabled={discordLoading}
                    />
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        discordEnabled
                          ? "text-green-400 bg-green-400/10"
                          : "text-sparkle-text-secondary bg-sparkle-border-secondary/20"
                      }`}
                    >
                      {discordEnabled
                        ? t("settings.enabled")
                        : t("settings.disabled")}
                    </span>
                  </div>
                </div>
              </SettingCard>
            </SettingSection>
            <SettingSection title={t("settings.updates_title")}>
              <SettingCard>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-sparkle-text mb-1">
                      {t("settings.updates_title")}
                    </h3>
                    <p className="text-sm text-sparkle-text-secondary">
                      {t("settings.check_for_updates_button")}
                    </p>
                  </div>
                  <Button onClick={checkForUpdates} disabled={checking}>
                    {checking
                      ? t("settings.checking_for_updates")
                      : t("settings.check_for_updates_button")}
                  </Button>
                </div>
              </SettingCard>
            </SettingSection>
            <SettingSection title={t("settings.profile_title")}>
              <SettingCard>
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-sparkle-text">
                    {t("settings.user_name_label")}
                  </h3>
                  <input
                    type="text"
                    defaultValue={localStorage.getItem("sparkle:user") || ""}
                    onChange={(e) =>
                      localStorage.setItem("sparkle:user", e.target.value)
                    }
                    className="w-full bg-sparkle-card border border-sparkle-border rounded-lg px-3 py-2 text-sparkle-text focus:ring-0 focus:outline-hidden"
                    placeholder={t("settings.user_name_placeholder")}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        const username = await invoke({
                          channel: "get-user-name",
                        });
                        localStorage.setItem("sparkle:user", username);
                        toast.success(t("settings.name_reset_success"));
                      }}
                    >
                      {t("settings.reset_to_system_name_button")}
                    </Button>
                  </div>
                </div>
              </SettingCard>
            </SettingSection>

            <SettingSection title={t("settings.privacy_title")}>
              <SettingCard>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-sparkle-text mb-1">
                      {t("settings.disable_analytics_label")}
                    </h3>
                    <p className="text-sm text-sparkle-text-secondary">
                      {t("settings.disable_analytics_description")}
                      <span className="inline-flex items-center gap-1 ml-2 text-yellow-500">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                        {t("settings.requires_restart")}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={posthogDisabled}
                      onChange={() => setPosthogDisabled((v) => !v)}
                    />
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        posthogDisabled
                          ? "text-green-400 bg-green-400/10"
                          : "text-sparkle-text-secondary bg-sparkle-border-secondary/20"
                      }`}
                    >
                      {posthogDisabled
                        ? t("settings.disabled")
                        : t("settings.enabled")}
                    </span>
                  </div>
                </div>
              </SettingCard>
            </SettingSection>

            <SettingSection title={t("settings.data_management_title")}>
              <SettingCard>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-sparkle-text mb-1">
                      {t("settings.legacy_backups_label")}
                    </h3>
                    <p className="text-sm text-sparkle-text-secondary">
                      {t("settings.legacy_backups_description")}
                      <code className="bg-sparkle-border-secondary/20 px-1 py-0.5 rounded-sm text-xs">
                        C:\Sparkle\Backup
                      </code>
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    {t("settings.delete_backups_button")}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-sparkle-text mb-1">
                      {t("settings.clear_sparkle_cache_label")}
                    </h3>
                    <p className="text-sm text-sparkle-text-secondary">
                      {t("settings.clear_sparkle_cache_description")}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={clearCache}>
                    {t("settings.clear_cache_button")}
                  </Button>
                  <Button
                    variant="secondary"
                    className="ml-2"
                    onClick={async () => {
                      await invoke({ channel: "open-log-folder" });
                    }}
                  >
                    {t("settings.open_log_folder_button")}
                  </Button>
                </div>
              </SettingCard>
            </SettingSection>

            <SettingSection title={t("settings.other_title")}>
              <SettingCard>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-sparkle-text mb-1">
                      {t("settings.show_tray_icon_label")}
                    </h3>
                    <p className="text-sm text-sparkle-text-secondary">
                      {t("settings.show_tray_icon_description")}
                      <span className="inline-flex items-center gap-1 ml-2 text-yellow-500">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                        {t("settings.requires_restart")}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={trayEnabled}
                      onChange={handleToggleTray}
                      disabled={trayLoading}
                    />
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        trayEnabled
                          ? "text-green-400 bg-green-400/10"
                          : "text-sparkle-text-secondary bg-sparkle-border-secondary/20"
                      }`}
                    >
                      {trayEnabled
                        ? t("settings.enabled")
                        : t("settings.disabled")}
                    </span>
                  </div>
                </div>
              </SettingCard>
            </SettingSection>

            <SettingSection title={t("settings.about_title")}>
              <SettingCard>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-sparkle-text mb-1">
                      {t("settings.sparkle_title")}
                    </h3>
                    <p className="text-sm text-sparkle-text-secondary">
                      {t("settings.version")} {jsonData.version}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-sparkle-text-secondary">
                      {t("settings.copyright", {
                        year: new Date().getFullYear(),
                      })}
                    </p>
                  </div>
                </div>
              </SettingCard>
            </SettingSection>
          </div>
        </div>
      </RootDiv>
    </>
  );
}

const SettingCard = ({ children, className = "" }) => (
  <Card className={`p-4 ${className}`}>{children}</Card>
);

const SettingSection = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-sparkle-primary">{title}</h2>
    {children}
  </div>
);

export default Settings;
