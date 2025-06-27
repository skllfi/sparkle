import { useState } from 'react'
import { Terminal, Settings, HardDrive, Activity, Shield, Wrench } from 'lucide-react'
import { invoke } from '@/lib/electron'
import RootDiv from '@/components/RootDiv'
import Modal from '@/components/ui/modal'
import { toast } from 'react-toastify'
import Button from '@/components/ui/button'

const utilities = [
  {
    name: 'System File Checker',
    command: 'sfc /scannow',
    type: 'System',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-blue-500'
  },
  {
    name: 'DISM Health Restore',
    command: 'DISM /Online /Cleanup-Image /RestoreHealth',
    type: 'System',
    icon: <Activity className="w-5 h-5" />,
    color: 'text-green-500'
  },
  {
    name: 'Check Disk',
    command: 'chkdsk C: /f /r /x',
    type: 'System',
    icon: <HardDrive className="w-5 h-5" />,
    color: 'text-yellow-500'
  },
  {
    name: 'Show Power Plan',
    type: 'System',
    command: 'powercfg /getactivescheme',
    icon: <Settings className="w-5 h-5" />,
    color: 'text-purple-500'
  },
  {
    name: 'Reset IP Stack',
    type: 'Network',
    command: 'netsh int ip reset',
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-pink-500'
  },
  {
    name: 'Reset Winsock',
    type: 'Network',
    command: 'netsh winsock reset',
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-red-500'
  },
  {
    name: 'Flush DNS Cache',
    type: 'Network',
    command: 'ipconfig /flushdns',
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-indigo-500'
  },
  {
    name: 'Disk Cleanup',
    type: 'System',
    command: 'cleanmgr.exe /sagerun:1',
    icon: <HardDrive className="w-5 h-5" />,
    color: 'text-teal-500'
  }
]

export default function UtilitiesPage() {
  const [running, setRunning] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUtility, setSelectedUtility] = useState(null)
  const [noExit, setNoExit] = useState(true)

  const confirmAndRun = async () => {
    if (!selectedUtility) return
    setModalOpen(false)
    setRunning(true)
    const toastId = toast.loading(`Running ${selectedUtility.name}...`)
    await invoke({
      channel: 'run-powershell-window',
      payload: { script: selectedUtility.command, name: selectedUtility.name, noExit: noExit }
    })
    toast.update(toastId, {
      render: `${selectedUtility.name} completed!`,
      type: 'success',
      isLoading: false,
      autoClose: 3000
    })
    setRunning(false)
    setSelectedUtility(null)
  }

  const openConfirmationModal = (utility) => {
    setSelectedUtility(utility)
    setModalOpen(true)
  }

  const openRegedit = async () => {
    await invoke({
      channel: 'run-powershell',
      payload: { script: 'start regedit.exe' }
    })
  }

  const openDiskCleanup = async () => {
    await invoke({
      channel: 'run-powershell',
      payload: { script: 'start cleanmgr.exe' }
    })
  }

  const openSystemInfo = async () => {
    await invoke({
      channel: 'run-powershell',
      payload: { script: 'start msinfo32.exe' }
    })
  }

  return (
    <RootDiv>
      <div className=" bg-sparkle-bg text-sparkle-text">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {utilities.map((util) => (
            <button
              key={util.name}
              onClick={() => openConfirmationModal(util)}
              disabled={running}
              className="bg-sparkle-card border border-sparkle-border p-4 rounded-2xl flex items-center gap-3 hover:border-sparkle-primary transition"
            >
              <div className={`${util.color}`}>{util.icon}</div>
              <div className="text-left">
                <h2 className="font-semibold">Run {util.name}</h2>
                <p className="text-sm text-sparkle-text-secondary">Type: {util.type}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex flex-row gap-2 mt-3">
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              id="noExitToggle"
              checked={noExit}
              onChange={() => setNoExit(!noExit)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-sparkle-border-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white  after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sparkle-primary"></div>
          </label>
          <p>Keep PowerShell window open after execution</p>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2 text-sparkle-text-secondary">Tools</h2>
          <div className="flex gap-4">
            <button
              onClick={openRegedit}
              className="bg-sparkle-card border border-sparkle-border px-4 py-2 rounded-xl hover:border-sparkle-primary transition text-sparkle-text"
            >
              Open Regedit
            </button>
            <button
              onClick={openDiskCleanup}
              className="bg-sparkle-card border border-sparkle-border px-4 py-2 rounded-xl hover:border-sparkle-primary transition text-sparkle-text"
            >
              Open Disk Cleanup
            </button>
            <button
              onClick={openSystemInfo}
              className="bg-sparkle-card border border-sparkle-border px-4 py-2 rounded-xl hover:border-sparkle-primary transition text-sparkle-text"
            >
              Open System Information
            </button>
          </div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="bg-sparkle-card p-6 rounded-2xl border border-sparkle-border text-sparkle-text w-[90vw] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
            {selectedUtility && (
              <>
                <p className="mb-4">
                  You are about to run{' '}
                  <span className={`${selectedUtility.color} underline  font-medium`}>
                    {selectedUtility.name}
                  </span>
                  .
                </p>
                <div className="bg-sparkle-border-secondary border border-sparkle-border p-2 text-sm rounded-md text-sparkle-text-secondary">
                  {selectedUtility.command}
                </div>
              </>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setModalOpen(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={confirmAndRun}>Run</Button>
            </div>
          </div>
        </Modal>
      </div>
    </RootDiv>
  )
}
