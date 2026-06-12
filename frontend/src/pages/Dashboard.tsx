import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, CreditCard, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { paymentsApi } from '../api/paymentsApi'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency, formatDate } from '../utils/helpers'
import { DashboardData } from '../types'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentsApi.dashboard()
      .then(setData)
      .catch(() => toast.error('Error cargando el dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  if (!data) return null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general de tus alquileres</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Propiedades" value={data.total_properties} sub={`${data.rented_properties} alquiladas`} icon={Building2} color="blue" />
        <StatCard label="Inquilinos activos" value={data.active_tenants} icon={Users} color="purple" />
        <StatCard label="Cobrado este mes" value={formatCurrency(data.collected_this_month)} icon={CheckCircle} color="green" />
        <StatCard label="Por cobrar" value={formatCurrency(data.amount_to_collect)} sub={`${data.pending_payments + data.overdue_payments} pagos`} icon={TrendingUp} color={data.overdue_payments > 0 ? 'red' : 'amber'} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Pagos pendientes" value={data.pending_payments} icon={Clock} color="amber" />
        <StatCard label="Pagos vencidos" value={data.overdue_payments} icon={AlertTriangle} color={data.overdue_payments > 0 ? 'red' : 'gray'} />
      </div>

      {data.overdue_alerts?.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="font-semibold text-red-800">Pagos vencidos — atención requerida</h2>
          </div>
          <div className="space-y-3">
            {data.overdue_alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{alert.tenant_name}</p>
                  <p className="text-xs text-gray-500">{alert.property_name} · {alert.month}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">{formatCurrency(alert.amount)}</p>
                  <p className="text-xs text-red-600">{alert.days_overdue} días vencido</p>
                </div>
                <Link to="/pagos" className="ml-4 text-xs text-blue-600 hover:text-blue-800 font-medium">Ver →</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { to: '/propiedades', label: 'Gestionar propiedades', icon: Building2 },
          { to: '/inquilinos',  label: 'Gestionar inquilinos',  icon: Users },
          { to: '/pagos',       label: 'Registrar pago',        icon: CreditCard },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-4 hover:border-blue-200 hover:bg-blue-50 transition-all group">
            <Icon size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}