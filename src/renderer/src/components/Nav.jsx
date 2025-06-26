import { Wrench, Home, Folder, LayoutGrid, Icon } from 'lucide-react'
import { broom } from '@lucide/lab'
import { useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import useRestartStore from '../store/restartState'
import info from '../../../../package.json'
import Button from './ui/button'
import { invoke } from '@/lib/electron'
import GithubIcon from './GithubIcon'
import DiscordIcon from './Discordicon'
import { Box } from 'lucide-react'
import { Settings } from 'lucide-react'

const tabIcons = {
  home: <Home size={20} />,
  tweaks: <Wrench size={20} />,
  clean: <Icon iconNode={broom} size={20} />,
  backup: <Folder size={20} />,
  utilities: <Box size={20} />,
  apps: <LayoutGrid size={20} />,
  settings: <Settings size={20} />
}

const tabs = {
  home: { label: 'Dashboard', path: '/' },
  tweaks: { label: 'Tweaks', path: '/tweaks' },
  clean: { label: 'Cleaner', path: '/clean' },
  backup: { label: 'Backup', path: '/backup' },
  utilities: { label: 'Utilities', path: '/utilities' },
  apps: { label: 'Apps', path: '/apps' },
  settings: { label: 'Settings', path: '/settings' }
}

function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { needsRestart } = useRestartStore()

  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/') return 'home'
    const match = Object.entries(tabs).find(([, { path: p }]) => p === path)
    return match ? match[0] : ''
  }

  const activeTab = getActiveTab()

  return (
    <nav className="h-screen w-52  text-sparkle-text fixed left-0 top-0 flex flex-col py-6 border-r border-sparkle-border-secondary z-40">
      <div className="flex-1 flex flex-col gap-2 px-3 mt-10">
        {Object.entries(tabs).map(([id, { label, path }]) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 border',
              activeTab === id
                ? 'bg-sparkle-card text-sparkle-text border-sparkle-border-secondary'
                : 'text-sparkle-text-secondary hover:bg-sparkle-border-secondary hover:text-sparkle-text border-transparent'
            )}
          >
            <div>{tabIcons[id]}</div>
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>
      {needsRestart && (
        <>
          <div className="mx-3 mb-2    flex flex-col items-center gap-2 text-sm">
            <div className="bg-red-600 text-sparkle-text rounded-lg p-3">
              <span>System Restart required to apply changes</span>
            </div>
            <Button onClick={() => invoke({ channel: 'restart' })} className="w-full">
              Restart Now
            </Button>
          </div>
        </>
      )}
      <div className="flex items-center justify-center gap-2 mt-4 mb-2">
        <a href="https://github.com/parcoil/sparkle" target="_blank">
          <GithubIcon className="w-5 fill-sparkle-text-secondary" />
        </a>
        <a href="https://discord.com/invite/En5YJYWj3Z" target="_blank">
          <DiscordIcon className="w-5 fill-sparkle-text-secondary" />
        </a>
      </div>
      <p className="text-sparkle-text-secondary text-center">v{info.version}</p>
    </nav>
  )
}

export default Nav
