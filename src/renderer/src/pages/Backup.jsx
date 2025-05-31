import React, { useEffect, useState } from 'react'
import {
  FolderArchive,
  RefreshCw,
  PlusCircle,
  Shield,
  Clock,
  FolderOpen,
  Trash2,
  RotateCcw,
  Loader2,
  X,
  Search,
  Info
} from 'lucide-react'
import RootDiv from '@/components/RootDiv'
import { invoke } from '@/lib/electron'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { toast } from 'react-toastify'

export default function BackupManager() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    backup: null,
    backupName: ''
  })

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const response = await invoke({ channel: 'get-backups' })
      const sorted = response.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime))
      setBackups(sorted)
      setError(null)
    } catch (error) {
      console.error('Error fetching backups:', error)
      setError('Failed to load backups. Please try again.')
      toast.error('Failed to load backups. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const validateBackupName = (name) => {
    if (!name.trim()) return 'Backup name cannot be empty'
    if (name.length > 50) return 'Backup name cannot exceed 50 characters'
    if (/[<>:"/\\|?*]/.test(name)) return 'Backup name contains invalid characters'
    return null
  }

  const handleCreateBackup = async () => {
    setModalState({ isOpen: true, type: 'create', backupName: '' })
  }

  const handleOpenFolder = async (backup) => {
    try {
      setProcessing(true)
      await invoke({ channel: 'open-backup-folder', payload: backup.path })
    } catch (err) {
      console.error('Failed to open folder:', err)
      toast.error('Failed to open backup folder')
    }
    setProcessing(false)
  }

  const handleRestoreBackup = async (backup) => {
    setModalState({ isOpen: true, type: 'restore', backup })
  }

  const handleDeleteBackup = async (backup) => {
    setModalState({ isOpen: true, type: 'delete', backup })
  }

  const executeBackupAction = async () => {
    setProcessing(true)
    try {
      switch (modalState.type) {
        case 'create':
          const nameError = validateBackupName(modalState.backupName)
          if (nameError) {
            toast.error(nameError)
            setProcessing(false)
            return
          }
          await invoke({ channel: 'create-backup', payload: modalState.backupName })
          await fetchBackups()
          toast.success('Backup created successfully')
          break
        case 'restore':
          const restoreResult = await invoke({
            channel: 'restore-backup',
            payload: modalState.backup.path
          })
          if (!restoreResult.success) {
            throw new Error(restoreResult.error || 'Failed to restore backup')
          }
          await fetchBackups()
          toast.success('Backup restored successfully')
          break
        case 'delete':
          const deleteResult = await invoke({
            channel: 'delete-backup',
            payload: modalState.backup.path
          })
          if (!deleteResult.success) {
            throw new Error(deleteResult.error || 'Failed to delete backup')
          }
          setBackups(backups.filter((b) => b.path !== modalState.backup.path))
          toast.success('Backup deleted successfully')
          break
      }
    } catch (err) {
      console.error(`Failed to ${modalState.type} backup:`, err)
      toast.error(`Failed to ${modalState.type} backup: ${err.message || 'Please try again.'}`)
    }
    setProcessing(false)
    setModalState({ isOpen: false, type: null, backup: null, backupName: '' })
  }

  const filteredBackups = backups.filter(
    (backup) =>
      backup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      backup.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getModalContent = () => {
    switch (modalState.type) {
      case 'create':
        return {
          title: 'Create Backup',
          message: 'Enter a name for your backup:',
          confirmText: 'Create Backup',
          variant: 'primary',
          showInput: true
        }
      case 'restore':
        return {
          title: 'Restore Backup',
          message: `Are you sure you want to restore the backup "${modalState.backup.name}" from ${formatDate(modalState.backup.creationTime)}? Current settings will be replaced.`,
          confirmText: 'Restore Backup',
          variant: 'primary'
        }
      case 'delete':
        return {
          title: 'Delete Backup',
          message: `Are you sure you want to delete the backup "${modalState.backup.name}" from ${formatDate(modalState.backup.creationTime)}? This action cannot be undone.`,
          confirmText: 'Delete Backup',
          variant: 'danger'
        }
      default:
        return null
    }
  }

  const modalContent = getModalContent()

  return (
    <RootDiv>
      <div className="h-full max-w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search backups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sparkle-primary focus:border-transparent transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={<RefreshCw size={16} />}
              onClick={fetchBackups}
              disabled={loading || processing}
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              icon={
                processing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <PlusCircle size={16} />
                )
              }
              onClick={handleCreateBackup}
              disabled={loading || processing}
            >
              Create Backup
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sparkle-primary/20 rounded-lg">
                <Shield className="text-sparkle-primary" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Backups</p>
                <p className="text-lg font-medium text-white">{backups.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sparkle-primary/20 rounded-lg">
                <Clock className="text-sparkle-primary" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Latest Backup</p>
                <p className="text-lg font-medium text-white">
                  {backups[0] ? formatDate(backups[0].creationTime) : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 size={32} className="text-sparkle-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
            <p className="text-center">{error}</p>
            <div className="flex justify-center mt-3">
              <Button variant="secondary" onClick={fetchBackups}>
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredBackups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-800 border border-slate-700 rounded-lg">
            <div className="p-4 bg-slate-700 rounded-full mb-4">
              <FolderArchive size={28} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-white">No Backups Found</h3>
            <p className="text-slate-400 max-w-sm mb-4">
              {searchQuery
                ? 'No backups match your search.'
                : 'Create a backup to preserve your system state. You can restore your system to any backup point when needed.'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                icon={<PlusCircle size={16} />}
                onClick={handleCreateBackup}
                disabled={processing}
              >
                Create Your First Backup
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 w-36">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 w-28">
                      Time
                    </th>
                    <th scope="col" className="px-4 py-3 w-32 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBackups.map((backup, index) => (
                    <tr
                      key={index}
                      className={`border-t border-slate-700/50 ${index % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/50'}`}
                    >
                      <td className="px-4 py-3 font-medium text-white">{backup.name}</td>
                      <td className="px-4 py-3 text-slate-300">{backup.description}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatDate(backup.creationTime)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatTime(backup.creationTime)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            className="!p-1.5"
                            onClick={() => handleRestoreBackup(backup)}
                            disabled={processing}
                            title="Restore Backup"
                          >
                            <RotateCcw size={16} className="text-sparkle-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="!p-1.5"
                            onClick={() => handleOpenFolder(backup)}
                            disabled={processing}
                            title="Open Backup Folder"
                          >
                            <FolderOpen size={16} className="text-sparkle-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="!p-1.5"
                            onClick={() => handleDeleteBackup(backup)}
                            disabled={processing}
                            title="Delete Backup"
                          >
                            <Trash2 size={16} className="text-red-400" />
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
          !processing && setModalState({ isOpen: false, type: null, backup: null, backupName: '' })
        }
      >
        {modalContent && (
          <div className="w-[400px] bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">{modalContent.title}</h3>
              <button
                onClick={() =>
                  !processing &&
                  setModalState({ isOpen: false, type: null, backup: null, backupName: '' })
                }
                className={`text-slate-400 transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:text-slate-300'}`}
                disabled={processing}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-slate-300 mb-4">{modalContent.message}</p>
              {modalContent.showInput && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={modalState.backupName}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, backupName: e.target.value }))
                    }
                    placeholder="Enter backup name"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sparkle-primary focus:border-transparent transition-colors"
                    disabled={processing}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() =>
                    !processing &&
                    setModalState({ isOpen: false, type: null, backup: null, backupName: '' })
                  }
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant={modalContent.variant}
                  onClick={executeBackupAction}
                  disabled={processing || (modalContent.showInput && !modalState.backupName.trim())}
                >
                  {processing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    modalContent.confirmText
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </RootDiv>
  )
}
