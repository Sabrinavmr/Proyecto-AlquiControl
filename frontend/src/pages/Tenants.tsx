import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Phone, Mail } from 'lucide-react'
import { tenantsApi } from '../api/tenantsApi'
import { propertiesApi } from '../api/propertiesApi'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { formatDate } from '../utils/helpers'
import { Tenant } from '../types'
import { useTenants } from '../hooks/useTenants'
import { useProperties } from '../hooks/useProperties'
import toast from 'react-hot-toast'

interface TenantForm {
  full_name: string
  phone: string
  email: string
  property_id: string
  move_in_date: string
  status: string
  notes: string
}

const EMPTY_FORM: TenantForm = {
  full_name: '', phone: '', email: '',
  property_id: '', move_in_date: '',
  status: 'Activo', notes: '',
}

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function Tenants() {
  const { tenants, loading, reload } = useTenants()
  const { properties } = useProperties()
  const [filter, setFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Tenant | null>(null)
  const [form, setForm] = useState<TenantForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (t: Tenant) => {
    setEditing(t)
    setForm({
      full_name: t.full_name, phone: t.phone, email: t.email,
      property_id: t.property_id ? String(t.property_id) : '',
      move_in_date: t.move_in_date, status: t.status, notes: t.notes || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, property_id: form.property_id ? parseInt(form.property_id) : null }
      if (editing) {
        await tenantsApi.update(editing.id, data)
        toast.success('Inquilino actualizado')
      } else {
        await tenantsApi.create(data)
        toast.success('Inquilino creado')
      }
      setModalOpen(false)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este inquilino?')) return
    try {
      await tenantsApi.delete(id)
      toast.success('Inquilino eliminado')
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    }
  }

  const filtered = tenants.filter(t => !filter || t.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquilinos</h1>
          <p className="text-gray-500 mt-1">{tenants.length} inquilinos registrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Nuevo inquilino
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['', 'Activo', 'Finalizado'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s || 'Todos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay inquilinos para mostrar</p>
          <button onClick={openCreate} className="mt-3 text-blue-600 text-sm hover:underline">Agregar el primero</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-600 font-bold text-sm">
                {t.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{t.full_name}</p>
                <div className="flex items-center gap-4 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone size={11} />{t.phone}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Mail size={11} />{t.email}
                  </span>
                </div>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-700">{t.property?.name || '—'}</p>
                <p className="text-xs text-gray-400">Desde {formatDate(t.move_in_date)}</p>
              </div>
              <StatusBadge status={t.status} />
              <div className="flex gap-1 ml-2">
                <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar inquilino' : 'Nuevo inquilino'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre completo" required>
            <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Teléfono" required>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            </Field>
            <Field label="Email" required>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </Field>
          </div>
          <Field label="Propiedad asignada">
            <select className="input" value={form.property_id} onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}>
              <option value="">Sin asignar</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha de ingreso" required>
              <input className="input" type="date" value={form.move_in_date} onChange={e => setForm(f => ({ ...f, move_in_date: e.target.value }))} required />
            </Field>
            <Field label="Estado">
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option>Activo</option>
                <option>Finalizado</option>
              </select>
            </Field>
          </div>
          <Field label="Observaciones">
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear inquilino'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}