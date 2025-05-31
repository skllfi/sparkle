import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import RootDiv from '../components/RootDiv'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Cpu } from 'lucide-react'
import { MemoryStick } from 'lucide-react'
import { HardDrive } from 'lucide-react'
import { CustomTooltip } from '../components/Tooltip'
import { invoke } from '../lib/electron'

function Home() {
  const [systemInfo, setSystemInfo] = useState(null)
  const [cpuHistory, setCpuHistory] = useState([])

  const formatBytes = (bytes) => {
    if (bytes === 0 || isNaN(bytes)) return 'N/A GB'
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  const updateSystemInfo = async () => {
    try {
      const info = await invoke({
        channel: 'get-system-info'
      })
      setSystemInfo(info)
      console.log(info)

      setCpuHistory((prevHistory) => {
        const newHistory = [
          ...prevHistory,
          {
            time: new Date().toLocaleTimeString(),
            value: info.cpu_usage
          }
        ]
        return newHistory.slice(-30)
      })
    } catch (error) {
      console.error('Error requesting system info:', error)
    }
  }

  const testRpc = async () => {
    try {
      await invoke({
        channel: 'start-discord-rpc'
      })
      console.log('Discord RPC start request sent!')
    } catch (error) {
      console.error('Failed to send Discord RPC start request:', error)
    }
  }

  useEffect(() => {
    updateSystemInfo()
    const interval = setInterval(updateSystemInfo, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const ramUsagePercentage = systemInfo
    ? (systemInfo.memory_used / systemInfo.memory_total) * 100
    : 0
  const storageUsagePercentage = systemInfo
    ? (systemInfo.c_drive_used / systemInfo.c_drive_total) * 100
    : 0

  return (
    <RootDiv className="flex flex-col p-6 bg-gray-50 dark:bg-base-200 min-h-screen overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          Welcome To Sparkle
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your all-in-one Windows optimization solution
        </p>
      </motion.div>

      {systemInfo ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              className="bg-white dark:bg-base-200 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="p-5">
                <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white flex items-center">
                  <Cpu className="w-5 h-5 mr-2" />
                  CPU Usage
                </h2>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-blue-600 dark:text-primary">
                    {formatPercentage(systemInfo.cpu_usage)}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {systemInfo.cpu_name}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-base-200 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="p-5">
                <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white flex items-center">
                  <MemoryStick className="w-5 h-5 mr-2" />
                  RAM Usage
                </h2>
                <div className="mb-2">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatPercentage(ramUsagePercentage)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatBytes(systemInfo.memory_used)} / {formatBytes(systemInfo.memory_total)}
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div
                    className="bg-green-600 dark:bg-green-400 h-2.5 rounded-full"
                    style={{ width: `${ramUsagePercentage}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-base-200 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="p-5">
                <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white flex items-center">
                  <HardDrive className="w-5 h-5 mr-2" />
                  Storage Usage
                </h2>
                <div className="mb-2">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {formatPercentage(storageUsagePercentage)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatBytes(systemInfo.c_drive_used)} / {formatBytes(systemInfo.c_drive_total)}
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 dark:bg-purple-400 h-2.5 rounded-full"
                    style={{ width: `${storageUsagePercentage}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="bg-white dark:bg-base-200 rounded-xl shadow-md p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              CPU Usage History
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cpuHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    stroke="#6B7280"
                  />
                  <Tooltip
                    formatter={(value) => [`${value.toFixed(1)}%`, 'CPU Usage']}
                    labelFormatter={(time) => `Time: ${time}`}
                    className="bg-black dark:bg-base-200"
                    content={<CustomTooltip />}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={500}
                    animationEasing="ease-in-out"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </RootDiv>
  )
}

export default Home
