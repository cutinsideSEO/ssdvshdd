import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HDDvsSSDPage from './App'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HDDvsSSDPage />
  </React.StrictMode>
)
