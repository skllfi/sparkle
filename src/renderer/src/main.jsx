import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'
import { init } from '@sentry/electron/renderer'
import { init as reactInit } from '@sentry/react'
import { PostHogProvider } from 'posthog-js/react'

init({
  sendDefaultPii: true,
  integrations: [],
  reactInit
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        capture_exceptions: true,
        debug: import.meta.env.MODE === 'development'
      }}
    >
      <HashRouter>
        <App />
      </HashRouter>
    </PostHogProvider>
  </React.StrictMode>
)
