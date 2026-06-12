import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import Tenants from './pages/Tenants'
import Payments from './pages/Payments'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-60 p-8 ">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/propiedades" element={<Properties />} />
            <Route path="/inquilinos" element={<Tenants />} />
            <Route path="/pagos" element={<Payments />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
