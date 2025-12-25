import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ElectionProvider } from './context/ElectionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ElectionProvider>
      <App />
    </ElectionProvider>
  </StrictMode>,
)
