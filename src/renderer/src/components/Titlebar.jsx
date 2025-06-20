import { Minus, Square, X, Sun, Moon, Palette } from 'lucide-react'
import { close, invoke, minimize, toggleMaximize } from '../lib/electron'
import sparkleLogo from '../../../../resources/sparklelogo.png'
import { useEffect, useState } from 'react'

function TitleBar() {
  const [theme, setTheme] = useState('dark')

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'purple' : 'dark'
    setTheme(nextTheme)
    document.body.classList.remove('dark', 'light', 'purple')
    document.body.classList.add(nextTheme)
    document.body.setAttribute('data-theme', nextTheme)
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.body.classList.add(savedTheme)
    document.body.setAttribute('data-theme', savedTheme)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  const ThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} />
      case 'purple':
        return <Palette size={16} />
      default:
        return <Moon size={16} />
    }
  }

  return (
    <div
      style={{ WebkitAppRegion: 'drag' }}
      className="h-[50px] fixed top-0 left-0 right-0  flex justify-between items-center pl-4 z-50 border-b border-sparkle-border-secondary"
    >
      <div className="flex items-center gap-3 border-r h-full w-48 border-sparkle-border-secondary pr-4">
        <img src={sparkleLogo} alt="Sparkle" className="h-5 w-5" />
        <span className="text-sparkle-text text-sm font-medium">Sparkle</span>
        <div className="bg-sparkle-card border border-sparkle-border-secondary p-1 rounded-xl w-16 text-center text-sm text-sparkle-text">
          Beta
        </div>
      </div>

      <div className="flex" style={{ WebkitAppRegion: 'no-drag' }}>
        {' '}
        <button
          className="h-[50px] w-12 inline-flex items-center justify-center text-sparkle-text-secondary hover:bg-sparkle-accent  transition-colors"
          title="Toggle Discord RPC"
        >
          <DiscordIcon />
        </button>
        <button
          onClick={toggleTheme}
          className="h-[50px] w-12 inline-flex items-center justify-center text-sparkle-text-secondary hover:bg-sparkle-accent transition-colors"
          title={`Current theme: ${theme}. Click to toggle.`}
        >
          <ThemeIcon />
        </button>
        <button
          onClick={minimize}
          className="h-[50px] w-12 inline-flex items-center justify-center text-slate-400 hover:bg-sparkle-accent transition-colors"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={toggleMaximize}
          className="h-[50px] w-12 inline-flex items-center justify-center text-slate-400 hover:bg-sparkle-accent transition-colors"
        >
          <Square size={14} />
        </button>
        <button
          onClick={close}
          className="h-[50px] w-12 inline-flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default TitleBar

function DiscordIcon() {
  const [isEnabled, setIsEnabled] = useState(true)

  function getDiscordStatus() {
    invoke({ channel: 'discord-rpc:get' }).then((status) => {
      setIsEnabled(status)
    })
  }

  function toggleDiscordStatus() {
    invoke({ channel: 'discord-rpc:toggle', payload: !isEnabled }).then((status) => {
      setIsEnabled(status)
    })
  }

  useEffect(() => {
    getDiscordStatus()
    const interval = setInterval(getDiscordStatus, 1000 * 60 * 5)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      onClick={toggleDiscordStatus}
      className="h-[50px] w-12 inline-flex items-center justify-center hover:bg-sparkle-accent transition-colors"
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`h-[20px] w-[20px] mx-3 my-auto ${
          isEnabled ? 'fill-sparkle-secondary' : 'fill-red-600'
        }`}
      >
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
      </svg>
    </div>
  )
}
