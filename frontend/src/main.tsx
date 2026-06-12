import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore: Allow importing CSS files as side-effects in this TSX entry file
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
