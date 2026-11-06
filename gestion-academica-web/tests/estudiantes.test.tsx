import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EstudiantesPanel } from '@/features/estudiantes/components/EstudiantesPanel'
import { configureHttpClient, http, ApiError } from '@/shared/api/httpClient'

const unauthorized = vi.fn()
const estudiante = { id: 7, nombre: 'Ana Prueba', correo: 'ana@example.test', edad: 22, carreraId: 3 }
const respuesta = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
function mostrar() {
 const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
 return render(<QueryClientProvider client={client}><EstudiantesPanel /></QueryClientProvider>)
}
beforeEach(() => { configureHttpClient({ getToken: () => 'token-de-prueba', onUnauthorized: unauthorized }); unauthorized.mockClear() })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
describe('Consumo de estudiantes', () => {
 it('muestra carga y después los datos; consulta el detalle real con Bearer', async () => {
  let resolver!: (value: Response) => void
  const fetchMock = vi.fn().mockImplementationOnce(() => new Promise<Response>(resolve => { resolver = resolve }))
    .mockResolvedValueOnce(respuesta({ ...estudiante, nombre: 'Ana Detalle' }))
  vi.stubGlobal('fetch', fetchMock)
  mostrar()
  expect(screen.getByText('Cargando estudiantes…')).toBeTruthy()
  resolver(respuesta([estudiante]))
  expect(await screen.findByText('Ana Prueba')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Ver detalle de Ana Prueba' }))
  expect(await screen.findByText('Ana Detalle')).toBeTruthy()
  expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/estudiantes')
  expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/estudiantes/7')
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer token-de-prueba')
  fireEvent.click(screen.getByText('Cerrar detalle'))
  expect(screen.queryByText('Ana Detalle')).toBeNull()
 })
 it('presenta lista vacía', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta([]))); mostrar()
  expect(await screen.findByText('No hay estudiantes registrados')).toBeTruthy()
 })
 it('permite recuperarse de una falla de red', async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(respuesta([estudiante]))
  vi.stubGlobal('fetch', fetchMock); mostrar()
  expect(await screen.findByText('No se pudo conectar con el servidor')).toBeTruthy()
  fireEvent.click(screen.getByText('Reintentar'))
  expect(await screen.findByText('Ana Prueba')).toBeTruthy()
 })
 it('explica un 403 sin cerrar la sesión', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({message:'Forbidden'},403))); mostrar()
  expect(await screen.findByText('Acceso denegado')).toBeTruthy()
  expect(unauthorized).not.toHaveBeenCalled()
 })
 it('invalida la sesión en 401', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({message:'Token inválido'},401))); mostrar()
  await waitFor(() => expect(unauthorized).toHaveBeenCalledOnce())
 })
 it('no adjunta credenciales previas ni cierra sesión al rechazar login público', async () => {
  const fetchMock = vi.fn().mockResolvedValue(respuesta({message:'Credenciales inválidas'},401))
  vi.stubGlobal('fetch', fetchMock)
  await expect(http('/auth/login', { method:'POST', body:{username:'admin',password:'incorrecta'}, auth:false })).rejects.toBeInstanceOf(ApiError)
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  expect(unauthorized).not.toHaveBeenCalled()
 })
 it('muestra error del servidor', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({},500))); mostrar()
  expect(await screen.findByText('Error interno del servidor')).toBeTruthy()
 })
 it('muestra 404 en detalle sin perder la lista', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(respuesta([estudiante])).mockResolvedValueOnce(respuesta({message:'Estudiante no encontrado'},404)))
  mostrar(); fireEvent.click(await screen.findByRole('button', {name:'Ver detalle de Ana Prueba'}))
  expect(await screen.findByText('Estudiante no encontrado')).toBeTruthy()
  expect(screen.getByText('Ana Prueba')).toBeTruthy()
 })
})
