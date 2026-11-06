import { http } from '@/shared/api/httpClient'
import type { Estudiante } from '../model/types'
export const estudiantesApi = {
  listar: (signal?: AbortSignal) => http<Estudiante[]>('/estudiantes', { signal }),
  detalle: (id: number, signal?: AbortSignal) => http<Estudiante>(`/estudiantes/${id}`, { signal }),
}
