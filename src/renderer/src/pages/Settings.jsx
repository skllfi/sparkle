import RootDiv from '@/components/RootDiv'
import React, { useEffect, useState } from 'react'
import jsonData from '../../../../package.json'
import { invoke } from '@/lib/electron'

const themes = [
  { label: 'Dark', value: '' },
  { label: 'Light', value: 'light' },
  { label: 'Purple', value: 'purple' },
  { label: 'Green', value: 'green' },
  { label: 'Gray', value: 'gray' }
]

function Settings() {
  const [theme, setTheme] = useState('')
  const [discordEnabled, setDiscordEnabled] = useState(true)
  const [discordLoading, setDiscordLoading] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || ''
    setTheme(savedTheme)
  }, [])

  useEffect(() => {
    document.body.classList.remove('light', 'purple', 'dark', 'green', 'gray')
    if (theme) {
      document.body.classList.add(theme)
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    invoke({ channel: 'discord-rpc:get' }).then((status) => setDiscordEnabled(status))
  }, [])

  const handleToggleDiscord = async () => {
    setDiscordLoading(true)
    const newStatus = !discordEnabled
    await invoke({ channel: 'discord-rpc:toggle', payload: newStatus })
    setDiscordEnabled(newStatus)
    setDiscordLoading(false)
  }

  return (
    <RootDiv>
      <div className="">
        <h1 className="text-2xl font-bold mb-6 text-sparkle-text">Settings</h1>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-sparkle-text">Theme</h2>
          <div className="flex gap-4">
            {themes.map((t) => (
              <label
                key={t.value}
                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-colors ${theme === t.value ? 'border-sparkle-primary bg-sparkle-card' : 'border-sparkle-border'} w-50 `}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={theme === t.value}
                  onChange={() => setTheme(t.value)}
                  className="accent-sparkle-primary sr-only"
                />
                <span className="text-sparkle-text">{t.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-sparkle-text">Discord RPC</h2>
          <div className="flex items-center gap-4 bg-sparkle-card border border-sparkle-border rounded-lg p-4">
            <span className="text-sparkle-text">Enable Discord Rich Presence</span>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={discordEnabled}
                onChange={handleToggleDiscord}
                disabled={discordLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-sparkle-border-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sparkle-primary"></div>
            </label>
            <span
              className={`text-xs ${discordEnabled ? 'text-green-400' : 'text-sparkle-text-secondary'}`}
            >
              {discordEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-sparkle-text">Other Settings</h2>
          <div className="bg-sparkle-card border border-sparkle-border rounded-lg p-4 text-sparkle-text-secondary">
            <p>More settings coming soon...</p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-sparkle-text">App Info</h2>
          <div className="bg-sparkle-card border border-sparkle-border rounded-lg p-4">
            <p className="text-sparkle-text-secondary">Sparkle v{jsonData.version}</p>
            <p className="text-sparkle-text-secondary">
              © {new Date().getFullYear()} Parcoil Network
            </p>
          </div>
        </div>
      </div>
    </RootDiv>
  )
}

export default Settings
