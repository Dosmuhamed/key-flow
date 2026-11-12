import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MobileGate } from './components/MobileGate.tsx'
import { loadSettings } from './lib/storage.ts'

// apply the saved theme before first paint so the mobile screen matches too
document.documentElement.dataset.theme = loadSettings().theme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileGate>
      <App />
    </MobileGate>
  </StrictMode>,
)
