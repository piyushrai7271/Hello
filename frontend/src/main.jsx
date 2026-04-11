import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast' // ✅ NEW

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <App />
      <Toaster position="top-right" /> {/* ✅ GLOBAL TOAST */}
    </>
  </StrictMode>,
)