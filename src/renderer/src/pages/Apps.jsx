import React, { useState } from 'react'
import data from '../assets/apps.json'
import RootDiv from '@/components/RootDiv'
import { Search } from 'lucide-react'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/Checkbox'
import Modal from '@/components/ui/modal'
import { invoke } from '@/lib/electron'
import sparkleLogo from '../../../../resources/sparklelogo.png'
import { Download } from 'lucide-react'
import { Trash } from 'lucide-react'

function Apps() {
  const [search, setSearch] = useState('')
  const [selectedApps, setSelectedApps] = useState([])
  const [loading, setLoading] = useState('')

  const appsList = data.apps

  const filteredApps = appsList.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase())
  )

  const appsByCategory = filteredApps.reduce((acc, app) => {
    if (!acc[app.category]) acc[app.category] = []
    acc[app.category].push(app)
    return acc
  }, {})

  const handleAppAction = async (type) => {
    const actionVerb = type === 'install' ? 'Installing' : 'Uninstalling'
    setLoading(type)

    try {
      const commands = selectedApps.flatMap((appId) => {
        const app = appsList.find(
          (a) => a.id === appId || (Array.isArray(a.id) && a.id.includes(appId))
        )
        if (!app) return []

        const ids = Array.isArray(app.id) ? app.id : [app.id]
        return ids.map((id) => `winget ${type} --id=${id} --silent -e`)
      })

      if (commands.length === 0) return

      const script = commands.join(' ; ')

      const result = await invoke({
        channel: 'run-powershell',
        payload: {
          script,
          name: `${actionVerb} selected apps`
        }
      })

      //console.log(`${actionVerb} complete`, result)
    } catch (error) {
      console.error(`Error ${actionVerb.toLowerCase()} apps:`, error)
    }

    setLoading('')
  }

  return (
    <RootDiv>
      <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 backdrop-blur-sm">
        <Search className="text-slate-400" />
        <input
          type="text"
          placeholder="Search for apps..."
          className="w-full py-3 px-0 bg-transparent border-none focus:outline-none focus:ring-0 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Modal open={!!loading} onClose={() => {}}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-sparkle-primary/30 rounded-full animate-spin border-t-sparkle-primary"></div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                {loading === 'install' ? 'Installing' : 'Uninstalling'} apps...
              </h3>
              <p className="text-sm text-slate-400">This may take a few moments</p>
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex gap-3 mt-5 mb-8">
        <Button
          className="text-white flex gap-2"
          disabled={selectedApps.length === 0 || loading}
          onClick={() => handleAppAction('install')}
        >
          <Download className="w-5" />
          Install Selected
        </Button>
        <Button
          className="flex gap-2"
          variant="danger"
          disabled={selectedApps.length === 0 || loading}
          onClick={() => handleAppAction('uninstall')}
        >
          <Trash className="w-5" />
          Uninstall Selected
        </Button>
        {selectedApps.length > 0 && (
          <Button
            className="flex gap-2 ml-auto bg-slate-800/50"
            variant="ghost"
            onClick={() => setSelectedApps([])}
          >
            Uncheck All
          </Button>
        )}
      </div>

      <div className="space-y-10 mb-10">
        {Object.entries(appsByCategory).map(([category, apps]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl text-sparkle-primary font-bold capitalize">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-sparkle-primary transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedApps.includes(app.id)}
                        onChange={() =>
                          setSelectedApps((prev) =>
                            prev.includes(app.id)
                              ? prev.filter((id) => id !== app.id)
                              : [...prev, app.id]
                          )
                        }
                      />
                      <div className="min-w-10 max-w-10 max--h-10 min-h-10 rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center">
                        {app.icon ? (
                          <img
                            src={app.icon}
                            alt={app.name}
                            className="w-8 h-8 object-contain rounded-md"
                          />
                        ) : (
                          <img src={sparkleLogo} alt="" className="w-6 h-6 opacity-50" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium group-hover:text-sparkle-primary transition">
                          {app.name}
                        </h3>
                        {app.info && (
                          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{app.info}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-center text-slate-600">
          Request more apps or make a pull request on{' '}
          <a href="https://github.com/parcoil/sparkle" target="_blank" rel="noopener noreferrer">
            github
          </a>
        </p>
      </div>
    </RootDiv>
  )
}

export default Apps
