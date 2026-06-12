import { useState, useEffect } from 'react'
import { tenantsApi } from '../api/tenantsApi'
import { Tenant } from '../types'
import toast from 'react-hot-toast'

//INQUILINO
export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    tenantsApi.list()
      .then(setTenants)
      .catch(() => toast.error('Error cargando inquilinos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return { tenants, loading, reload: load }
}