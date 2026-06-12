import { useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { propertiesApi } from '../api/propertiesApi'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { formatCurrency } from '../utils/helpers'
import { Property } from '../types'
import { useProperties } from '../hooks/useProperties'
import toast from 'react-hot-toast'

const TYPES = ['Departamento', 'Habitación', 'Local', 'Casa', 'Otro']
const STATUSES = ['Disponible', 'Alquilada', 'En mantenimiento']

interface PropertyForm {
  name: string
  address: string
  type: string
  monthly_price: string
  status: string
  notes: string
}

const EMPTY_FORM: PropertyForm = {
  name: '', address: '', type: 'Departamento',
  monthly_price: '', status: 'Disponible', notes: '',
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

export default function Properties() {
  const { properties, loading, reload } = useProperties()
  const [filter, setFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)
  const [form, setForm] = useState<PropertyForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (p: Property) => {
    setEditing(p)
    setForm({ name: p.name, address: p.address, type: p.type, monthly_price: String(p.monthly_price), status: p.status, notes: p.notes || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, monthly_price: parseFloat(form.monthly_price) }
      if (editing) {
        await propertiesApi.update(editing.id, data)
        toast.success('Propiedad actualizada')
      } else {
        await propertiesApi.create(data)
        toast.success('Propiedad creada')
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
    if (!confirm('¿Eliminar esta propiedad?')) return
    try {
      await propertiesApi.delete(id)
      toast.success('Propiedad eliminada')
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    }
  }

  const filtered = properties.filter(p => !filter || p.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-gray-500 mt-1">{properties.length} propiedades registradas</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Nueva propiedad
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'Todas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay propiedades para mostrar</p>
          <button onClick={openCreate} className="mt-3 text-blue-600 text-sm hover:underline">Agregar la primera</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{p.type}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{p.address}</p>
              </div>
              <div className="text-right mr-4">
                <p className="font-bold text-gray-900">{formatCurrency(p.monthly_price)}</p>
                <p className="text-xs text-gray-400">por mes</p>
              </div>
              <StatusBadge status={p.status} />
              <div className="flex gap-1 ml-2">
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar propiedad' : 'Nueva propiedad'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre o alias" required>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </Field>
          <Field label="Dirección" required>
            <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Precio mensual ($)" required>
            <input className="input" type="number" min="0" step="1000" value={form.monthly_price}
              onChange={e => setForm(f => ({ ...f, monthly_price: e.target.value }))} required />
          </Field>
          <Field label="Observaciones">
            <textarea className="input" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear propiedad'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}