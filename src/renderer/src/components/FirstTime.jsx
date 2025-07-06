import { useEffect, useState } from 'react'
import Modal from '@/components/ui/modal'
import Button from './ui/button'
import { toast } from 'react-toastify'
import { invoke } from '@/lib/electron'
import data from '../../../../package.json'

function FirstTime() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const firstTime = localStorage.getItem('firstTime')
    if (firstTime === null || firstTime === 'true') {
      const timer = setTimeout(() => setOpen(true), 20)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleGetStarted = async () => {
    localStorage.setItem('firstTime', 'false')
    setOpen(false)
    toast.warn('Creating restore point... Please wait before applying tweaks.')
    try {
      await invoke({ channel: 'create-sparkle-restore-point' })
      toast.success('Restore point created!')
    } catch (err) {
      toast.error('Failed to create restore point.')
      console.error('Error creating restore point:', err)
    }
  }
  const handleNoRestorePoint = () => {
    localStorage.setItem('firstTime', 'false')
    setOpen(false)
  }

  return (
    <Modal open={open}>
      <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-8 shadow-2xl max-w-lg w-full mx-4 flex flex-col items-center">
        <h1 className="text-2xl font-semibold text-sparkle-text mb-3 text-center">
          Welcome to Sparkle
        </h1>
        <p className="text-sparkle-text-secondary mb-8 text-center ">
          It looks like this is your first time here. Would you like to create a restore point
          before you start?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button className="" onClick={handleNoRestorePoint} variant="danger">
            No (Not Recommended)
          </Button>
          <Button className="" onClick={handleGetStarted}>
            Yes (Recommended)
          </Button>
        </div>
        <p className="text-sparkle-text-secondary mt-4">
          Sparkle Version: {data?.version || 'Error cant get version'}
        </p>
      </div>
    </Modal>
  )
}

export default FirstTime
