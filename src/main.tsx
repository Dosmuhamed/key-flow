import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import { MobileGate } from './components/MobileGate.tsx'
import { applyAppearance, loadAppearance } from './lib/appearance.ts'

// apply the saved look before first paint so nothing flashes
applyAppearance(loadAppearance())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileGate>
      <App />
    </MobileGate>
  </StrictMode>,
)
