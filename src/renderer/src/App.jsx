import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import TitleBar from './components/Titlebar'
import Nav from './components/Nav'
import { invoke } from './lib/electron.js'
import './app.css'
import { ToastContainer, Slide } from 'react-toastify'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Tweaks from './pages/Tweaks'
import Clean from './pages/Clean'
import Apps from './pages/Apps'
import Loading from './components/Loading'
import Backup from './pages/Backup'
import Utilities from './pages/Utilities'
import Settings from './pages/Settings'

function App() {
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(localStorage.getItem('theme'))

  useEffect(() => {
    const current = theme || 'dark'
    setTheme(current)
    document.body.classList.remove('dark', 'light', 'purple')
    document.body.classList.add(current)
    document.body.setAttribute('data-theme', current)

    if (localStorage.getItem('posthogDisabled') === 'true') {
      document.body.classList.add('ph-no-capture')
    } else {
      document.body.classList.remove('ph-no-capture')
    }
  }, [])
  return (
    <div className="flex flex-col h-screen bg-sparkle-bg text-sparkle-text overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 pt-[50px] relative">
        <AnimatePresence>
          {loading == true && (
            <motion.div
              className="absolute inset-0 z-50 bg-sparkle-bg"
              initial={{ opacity: 1 }}
              exit={{
                y: '-100%',
                transition: {
                  duration: 0.8,
                  ease: [0.65, 0, 0.35, 1]
                }
              }}
            >
              <Loading onLoadingComplete={() => setLoading(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        <>
          <Nav />

          <main className="flex-1 ml-52 p-6 ">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tweaks" element={<Tweaks />} />
                  <Route path="/clean" element={<Clean />} />
                  <Route path="/backup" element={<Backup />} />
                  <Route path="/utilities" element={<Utilities />} />
                  <Route path="/apps" element={<Apps />} />{' '}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </>
      </div>

      <ToastContainer
        stacked
        limit={5}
        position="bottom-right"
        theme="dark"
        transition={Slide}
        toastClassName="bg-gray-800 text-white"
      />
    </div>
  )
}

export default App
