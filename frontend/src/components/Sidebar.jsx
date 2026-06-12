import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, CreditCard, Sparkles } from 'lucide-react'

const links = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/propiedades', icon: Building2,     label: 'Propiedades' },
  { to: '/inquilinos',  icon: Users,         label: 'Inquilinos' },
  { to: '/pagos',       icon: CreditCard,    label: 'Pagos' },
  { to: '/asistente',   icon: Sparkles,      label: 'Asistente IA' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-none text-sm">AlquiControl</p>
            <p className="text-xs text-gray-400 mt-0.5">Gestión de alquileres</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">v1.0 · Con IA integrada</p>
      </div>
    </aside>
  )
}
