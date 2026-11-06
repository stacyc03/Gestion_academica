/** Formato de error que devuelve
 * el backend (GlobalExceptionHandler y handlers
 * 401/403)
 */
export interface ApiErrorBody{
    timestamp: string
    status: number
    error: string
    message?: string
    errors?: Record<string, string>
}