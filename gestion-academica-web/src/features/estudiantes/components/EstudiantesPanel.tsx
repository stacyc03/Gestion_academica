import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { estudiantesApi } from '../api/estudiantesApi'
import { ApiError } from '@/shared/api/httpClient'

function ErrorConsulta({ error, reintentar }: { error: Error; reintentar: () => void }) {
  const status = error instanceof ApiError ? error.status : null
  return <div className="notice error" role="alert">
    <strong>{status === 403 ? 'Acceso denegado' : 'No pudimos completar la consulta'}</strong>
    <p>{status === 403 ? 'Tu cuenta no tiene permiso para consultar estudiantes. Se requiere el rol ADMIN o DOCENTE.' : error.message}</p>
    <button className="secondary" onClick={reintentar}>Reintentar</button>
  </div>
}

function DetalleEstudiante({ id, cerrar }: { id: number; cerrar: () => void }) {
  const detalle = useQuery({
    queryKey: ['estudiantes', 'detalle', id],
    queryFn: ({ signal }) => estudiantesApi.detalle(id, signal),
  })
  return <section className="card detail" aria-labelledby="detalle-titulo">
    <div className="section-heading"><div><span className="eyebrow">REGISTRO SELECCIONADO</span><h2 id="detalle-titulo">Detalle del estudiante</h2></div><button className="secondary" onClick={cerrar}>Cerrar detalle</button></div>
    {detalle.isPending && <p role="status" className="notice">Cargando detalle…</p>}
    {detalle.error && <ErrorConsulta error={detalle.error} reintentar={() => void detalle.refetch()} />}
    {detalle.data && !detalle.error && <dl className="detail-grid">
      <div><dt>Identificador</dt><dd>#{detalle.data.id}</dd></div>
      <div><dt>Nombre completo</dt><dd>{detalle.data.nombre}</dd></div>
      <div><dt>Correo electrónico</dt><dd>{detalle.data.correo}</dd></div>
      <div><dt>Edad</dt><dd>{detalle.data.edad} años</dd></div>
      <div><dt>ID de carrera</dt><dd>{detalle.data.carreraId}</dd></div>
    </dl>}
  </section>
}

export function EstudiantesPanel() {
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const consulta = useQuery({
    queryKey: ['estudiantes', 'lista'],
    queryFn: ({ signal }) => estudiantesApi.listar(signal),
  })
  return <>
    <section className="card" aria-labelledby="estudiantes-titulo">
      <div className="section-heading"><div><span className="eyebrow">DIRECTORIO ACADÉMICO</span><h2 id="estudiantes-titulo">Estudiantes {consulta.data && <span className="count">{consulta.data.length}</span>}</h2></div>
        <button className="secondary" disabled={consulta.isFetching} onClick={() => { setSeleccionado(null); void consulta.refetch() }}>{consulta.isFetching ? 'Actualizando…' : 'Actualizar lista'}</button>
      </div>
      {consulta.isPending && <p role="status" className="notice">Cargando estudiantes…</p>}
      {consulta.error && <ErrorConsulta error={consulta.error} reintentar={() => void consulta.refetch()} />}
      {consulta.data && !consulta.error && (consulta.data.length === 0
        ? <div className="empty" role="status"><h3>No hay estudiantes registrados</h3><p>Cuando existan registros en la API, aparecerán aquí. Puedes actualizar la lista después de agregarlos.</p></div>
        : <div className="table-scroll"><table><caption className="sr-only">Estudiantes registrados en la API de Gestión Académica</caption><thead><tr><th>ID</th><th>Nombre</th><th>Correo electrónico</th><th>Edad</th><th>ID de carrera</th><th>Acción</th></tr></thead><tbody>
          {consulta.data.map(estudiante => <tr key={estudiante.id} className={seleccionado === estudiante.id ? 'selected' : ''}>
            <td>#{estudiante.id}</td><td className="student-name">{estudiante.nombre}</td><td>{estudiante.correo}</td><td>{estudiante.edad}</td><td>{estudiante.carreraId}</td>
            <td><button className="text-button" aria-label={`Ver detalle de ${estudiante.nombre}`} aria-pressed={seleccionado === estudiante.id} onClick={() => setSeleccionado(estudiante.id)}>Ver detalle →</button></td>
          </tr>)}
        </tbody></table></div>)}
    </section>
    {seleccionado !== null && <DetalleEstudiante key={seleccionado} id={seleccionado} cerrar={() => setSeleccionado(null)} />}
  </>
}
