export interface Property {
    id: number
    name: string
    address: string
    type: string
    monthly_price: number
    status: 'Disponible' | 'Alquilada' | 'En mantenimiento'
    notes?: string
    created_at: string
}

export interface Tenant {
  id: number
  full_name: string
  phone: string
  email: string
  property_id?: number
  property?: Property
  move_in_date: string
  status: 'Activo' | 'Finalizado'
  notes?: string
  created_at: string
}

export interface Payment {
  id: number
  tenant_id: number
  property_id: number
  tenant?: Tenant
  property?: Property
  month: string
  amount: number
  due_date: string
  paid_date?: string
  payment_method: string
  status: 'Pendiente' | 'Pagado' | 'Vencido'
  notes?: string
  email_sent: boolean
  email_sent_at?: string
  created_at: string
}

export interface DashboardData {
  total_properties: number
  rented_properties: number
  available_properties: number
  active_tenants: number
  pending_payments: number
  overdue_payments: number
  collected_this_month: number
  amount_to_collect: number
  overdue_alerts: OverdueAlert[]
}

export interface OverdueAlert {
  id: number
  tenant_name: string
  property_name: string
  month: string
  amount: number
  days_overdue: number
}

export interface AssistantResponse {
  message: string
  email_sent: boolean
  email_to?: string
}