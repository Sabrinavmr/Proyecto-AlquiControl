

export const formatCurrency = (amount: number ): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const whatsappLink = (phone: string, message: string): string => {
  // Limpiar el número: solo dígitos, agregar código de país si falta
  const clean = phone.replace(/\D/g, '')
  const number = clean.startsWith('549') ? clean : `549${clean}`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string; border?: string }> = {
  Pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  Pagado:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-400' },
  Vencido:   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  Disponible:         { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400' },
  Alquilada:          { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  'En mantenimiento': { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
  Activo:     { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  Finalizado: { bg: 'bg-gray-100', text: 'text-gray-600',  dot: 'bg-gray-400' },
}
