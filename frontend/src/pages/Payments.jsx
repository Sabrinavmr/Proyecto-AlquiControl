import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CreditCard, CheckCircle, Sparkles, MessageSquare, ExternalLink } from 'lucide-react'
import { paymentsApi } from '../api/paymentsApi'
import { tenantsApi } from '../api/tenantsApi'
import { propertiesApi } from '../api/propertiesApi'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { formatCurrency, formatDate, whatsappLink } from '../utils/helpers'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  tenant_id: '', property_id: '', month: '', amount: '',
  due_date: '', payment_method: 'Transferencia', notes: '',
}

const METHODS = ['Efectivo', 'Transferencia', 'Mercado Pago', 'Otro']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [paidModal, setPaidModal] = useState(null)
  const [assistantModal, setAssistantModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiTone, setAiTone] = useState('amable')

  const load = () => {
    Promise.all([paymentsApi.list(), tenantsApi.list(), propertiesApi.list()])
      .then(([p, t, pr]) => { setPayments(p); setTenants(t); setProperties(pr) })
      .catch(() => toast.error('Error cargando datos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const currentYear = new Date().getFullYear()
  const monthOptions = MONTHS.flatMap(m => [`${m} ${currentYear}`, `${m} ${currentYear + 1}`])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, tenant_id: parseInt(form.tenant_id), property_id: parseInt(form.property_id), amount: parseFloat(form.amount) }
      await paymentsApi.create(data)
      toast.success('Pago registrado')
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMarkPaid = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const date = e.target.paid_date.value
      await paymentsApi.markPaid(paidModal.id, { paid_date: date })
      toast.success('Pago marcado como recibido')
      setPaidModal(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este pago?')) return
    try {
      await paymentsApi.delete(id)
      toast.success('Pago eliminado')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSendReminder = async () => {
    setAiLoading(true)
    setAiResult(null)
    try {
      const result = await paymentsApi.sendReminder(assistantModal.id, { payment_id: assistantModal.id, tone: aiTone, send_email: true })
      setAiResult(result)
      if (result.email_sent) {
        toast.success(`Email enviado a ${result.email_to}`)
        load()
      } else {
        toast('Mensaje generado (email no configurado)', { icon: '⚠️' })
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const filtered = payments.filter(p => !filter || p.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-500 mt-1">{payments.length} pagos registrados</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Registrar pago
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['', 'Pendiente', 'Vencido', 'Pagado'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s || 'Todos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay pagos para mostrar</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-200 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900">{p.tenant?.full_name || '—'}</p>
                  <span className="text-xs text-gray-400">·</span>
                  <p className="text-sm text-gray-500">{p.property?.name || '—'}</p>
                </div>
                <p className="text-sm text-gray-400">{p.month} · Vence {formatDate(p.due_date)}</p>
              </div>
              <div className="text-right mr-4">
                <p className="font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                <p className="text-xs text-gray-400">{p.payment_method}</p>
              </div>
              <StatusBadge status={p.status} />
              {p.email_sent && (
                <span title="Email enviado" className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={12} className="text-green-600" />
                </span>
              )}
              <div className="flex gap-1 ml-2">
                {p.status !== 'Pagado' && (
                  <>
                    <button onClick={() => { setAssistantModal(p); setAiResult(null) }}
                      title="Asistente IA" className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors">
                      <Sparkles size={15} />
                    </button>
                    <button onClick={() => setPaidModal(p)}
                      title="Marcar como pagado" className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                      <CheckCircle size={15} />
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo pago */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar pago">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Inquilino" required>
            <select className="input" value={form.tenant_id} onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))} required>
              <option value="">Seleccionar...</option>
              {tenants.filter(t => t.status === 'Activo').map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </Field>
          <Field label="Propiedad" required>
            <select className="input" value={form.property_id} onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))} required>
              <option value="">Seleccionar...</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mes" required>
              <select className="input" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} required>
                <option value="">Seleccionar...</option>
                {monthOptions.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Monto ($)" required>
              <input className="input" type="number" min="0" step="1000" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha de vencimiento" required>
              <input className="input" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
            </Field>
            <Field label="Medio de pago">
              <select className="input" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Guardando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal marcar como pagado */}
      <Modal isOpen={!!paidModal} onClose={() => setPaidModal(null)} title="Confirmar pago recibido" size="sm">
        {paidModal && (
          <form onSubmit={handleMarkPaid} className="space-y-4">
            <p className="text-sm text-gray-600">
              Marcando como pagado: <strong>{paidModal.tenant?.full_name}</strong> — {paidModal.month}
            </p>
            <Field label="Fecha de pago" required>
              <input name="paid_date" className="input" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setPaidModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-green-600 rounded-xl text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
                {saving ? 'Guardando...' : 'Confirmar pago'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal asistente IA */}
      <Modal isOpen={!!assistantModal} onClose={() => { setAssistantModal(null); setAiResult(null) }} title="Asistente IA — Envío automático" size="md">
        {assistantModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="text-gray-600"><strong>{assistantModal.tenant?.full_name}</strong> · {assistantModal.property?.name}</p>
              <p className="text-gray-500 mt-0.5">{assistantModal.month} · {formatCurrency(assistantModal.amount)} · <StatusBadge status={assistantModal.status} /></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tono del mensaje</label>
              <div className="flex gap-2">
                {[['amable', 'Amable'], ['formal', 'Formal'], ['urgente', 'Urgente']].map(([val, label]) => (
                  <button key={val} onClick={() => setAiTone(val)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      aiTone === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSendReminder}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-all"
            >
              <Sparkles size={16} />
              {aiLoading ? 'Claude está generando el mensaje...' : 'Generar y enviar con IA'}
            </button>

            {aiResult && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">
                    {aiResult.email_sent ? `Email enviado a ${aiResult.email_to}` : 'Mensaje generado'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line bg-white rounded-lg p-3 border border-green-100">{aiResult.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(aiResult.message); toast.success('Copiado') }}
                    className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Copiar mensaje
                  </button>
                  {assistantModal.tenant?.phone && (
                    <a
                      href={whatsappLink(assistantModal.tenant.phone, aiResult.message)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 flex-1 py-2 bg-green-600 text-white rounded-lg text-xs justify-center hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink size={12} /> Abrir WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
