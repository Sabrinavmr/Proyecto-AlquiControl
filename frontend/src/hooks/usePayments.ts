import { useState, useEffect } from 'react'
import { paymentsApi } from '../api/paymentsApi'
import { Payment } from '../types'
import toast from 'react-hot-toast'

//PAGOS
export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    paymentsApi.list()
      .then(setPayments)
      .catch(() => toast.error('Error cargando pagos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return { payments, loading, reload: load }
}