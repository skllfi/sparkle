import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'
import { init } from '@sentry/electron/renderer'
import { init as reactInit } from '@sentry/react'

init({
  sendDefaultPii: true,
  integrations: [],
  reactInit
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>
)
