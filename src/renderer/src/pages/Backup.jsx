import { useEffect, useState } from 'react'
import { RefreshCw, PlusCircle, Shield, Clock, RotateCcw, Loader2, X, Search } from 'lucide-react'
import RootDiv from '@/components/RootDiv'
import { invoke } from '@/lib/electron'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { toast } from 'react-toastify'
import { Trash } from 'lucide-react'

export default function RestorePointManager() {
  const [restorePoints, setRestorePoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    restorePoint: null
  })

  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [customName, setCustomName] = useState('')

  const fetchRestorePoints = async () => {
    setLoading(true)
    try {
      const response = await invoke({ channel: 'get-restore-points' })
      setRestorePoints(response.sort((a, b) => new Date(b.CreationTime) - new Date(a.CreationTime)))
    } catch (error) {
      toast.error('Failed to load restore points.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestorePoints()
  }, [])

  const handleCreateRestorePoint = async () => {
    setProcessing(true)
    try {
      await invoke({ channel: 'create-sparkle-restore-point' })
      toast.success('Restore point created!')
      await fetchRestorePoints()
    } catch (err) {
      toast.error('Failed to create restore point.')
    }
    setProcessing(false)
  }

  const handleRestore = (restorePoint) => {
    setModalState({ isOpen: true, type: 'restore', restorePoint })
  }

  const executeRestore = async () => {
    setProcessing(true)
    try {
      await invoke({
        channel: 'restore-restore-point',
        payload: modalState.restorePoint.SequenceNumber
      })
      toast.success('System restore started. Your PC may restart.')
    } catch (err) {
      toast.error('Failed to start system restore.')
    }
    setProcessing(false)
    setModalState({ isOpen: false, type: null, restorePoint: null })
  }

  const handleCustomRestorePoint = async () => {
    setProcessing(true)
    try {
      if (!customName.trim()) {
        toast.error('Please enter a name for the restore point.')
        setProcessing(false)
        return
      }
      await invoke({ channel: 'create-restore-point', payload: customName })
      toast.success('Restore point created!')
      setCustomModalOpen(false)
      setCustomName('')
      await fetchRestorePoints()
    } catch (err) {
      toast.error('Failed to create restore point.')
    }
    setProcessing(false)
  }
  const handleDeleteAll = async () => {
    setProcessing(true)
    await invoke({ channel: 'delete-all-restore-points' })
    toast.success('All restore points deleted successfully.')
    setProcessing(false)
    await fetchRestorePoints()
  }
  const filteredRestorePoints = restorePoints.filter((rp) =>
    (rp.Description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <RootDiv>
      <div className="h-full max-w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64 mt-1 ml-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sparkle-text-secondary"
              size={16}
            />
            <input
              type="text"
              placeholder="Search Restore Points..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-sparkle-card border border-sparkle-border rounded-lg text-sparkle-text placeholder-sparkle-text-secondary focus:outline-none focus:ring-2 focus:ring-sparkle-primary focus:border-transparent transition-colors"
            />
          </div>
          <div className="flex gap-2 mr-1">
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              disabled={loading || processing}
              className="flex items-center gap-2"
            >
              <Trash size={16} />
              Delete All
            </Button>
            <Button
              variant="secondary"
              onClick={fetchRestorePoints}
              className="flex items-center gap-2"
              disabled={loading || processing}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRestorePoint}
              className="flex items-center gap-2"
              disabled={loading || processing}
            >
              {processing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <PlusCircle size={16} />
              )}
              Quick Restore Point
            </Button>
            <Button
              variant="primary"
              onClick={() => setCustomModalOpen(true)}
              disabled={loading || processing}
            >
              Custom Restore Point
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 size={32} className="text-sparkle-primary animate-spin" />
          </div>
        ) : filteredRestorePoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-sparkle-card border border-sparkle-border rounded-lg">
            <div className="p-4 bg-sparkle-secondary rounded-full mb-4">
              <Shield size={28} className="text-sparkle-text" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-sparkle-text">No Restore Points Found</h3>
            <p className="text-sparkle-text-secondary max-w-sm mb-4">
              {searchQuery
                ? 'No restore points match your search.'
                : 'Create a restore point to preserve your system state. You can restore your system to any point when needed.'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                icon={<PlusCircle size={16} />}
                onClick={handleCreateRestorePoint}
                disabled={processing}
              >
                Create a Quick Restore Point
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-sparkle-card border border-sparkle-border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-sparkle-text-secondary uppercase bg-sparkle-card sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-4 w-32 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestorePoints.map((rp, index) => (
                    <tr key={index} className={`border-t border-sparkle-border`}>
                      <td className="px-6 py-4 font-medium text-sparkle-text">{rp.Description}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            className="!p-2"
                            onClick={() => handleRestore(rp)}
                            disabled={processing}
                            title="Restore System"
                          >
                            <RotateCcw size={16} className="text-sparkle-primary" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Modal
        open={modalState.isOpen}
        onClose={() =>
          !processing && setModalState({ isOpen: false, type: null, restorePoint: null })
        }
      >
        {modalState.type === 'restore' && (
          <div className="w-[400px] bg-sparkle-bg border border-sparkle-border rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-sparkle-border">
              <h3 className="text-lg font-medium text-sparkle-text">Restore System</h3>
              <button
                onClick={() =>
                  !processing && setModalState({ isOpen: false, type: null, restorePoint: null })
                }
                className={`text-sparkle-text-secondary transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:text-sparkle-text'}`}
                disabled={processing}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sparkle-text mb-4">
                Are you sure you want to restore your system to "
                {modalState.restorePoint.Description}" from{' '}
                {formatDate(modalState.restorePoint.CreationTime)}? Your PC may restart.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() =>
                    !processing && setModalState({ isOpen: false, type: null, restorePoint: null })
                  }
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={executeRestore} disabled={processing}>
                  {processing ? <Loader2 size={16} className="animate-spin" /> : 'Restore'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={customModalOpen}
        onClose={() => {
          if (!processing) {
            setCustomModalOpen(false)
            setCustomName('')
          }
        }}
      >
        <div className="w-[400px] bg-sparkle-bg border border-sparkle-border rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-sparkle-border">
            <h3 className="text-lg font-medium text-sparkle-text">Create Custom Restore Point</h3>
            <button
              onClick={() => {
                if (!processing) {
                  setCustomModalOpen(false)
                  setCustomName('')
                }
              }}
              className={`text-sparkle-text-secondary transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:text-sparkle-text'}`}
              disabled={processing}
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter restore point name"
              className="w-full px-3 py-2 bg-sparkle-card border border-sparkle-border rounded-lg text-sparkle-text placeholder-sparkle-text-secondary focus:outline-none focus:ring-2 focus:ring-sparkle-primary focus:border-transparent transition-colors mb-4"
              disabled={processing}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!processing) {
                    setCustomModalOpen(false)
                    setCustomName('')
                  }
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCustomRestorePoint}
                disabled={processing || !customName.trim()}
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
              </Button>
            </div>
            <p className="text-sm text-center mt-3 text-sparkle-text-muted">
              This may take a while depending on your hardware
            </p>
          </div>
        </div>
      </Modal>
    </RootDiv>
  )
}
