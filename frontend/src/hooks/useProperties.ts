import { useState, useEffect } from "react"
import { propertiesApi } from "../api/propertiesApi"
import { Property } from "../types"
import toast from 'react-hot-toast'

//PROPIEDADES
export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    propertiesApi.list()
      .then(setProperties)
      .catch(() => toast.error('Error cargando propiedades'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return { properties, loading, reload: load }
}