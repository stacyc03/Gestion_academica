export type Rol = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE'

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse{
    accessToken: string
    tokenType: 'Bearer'
    expiresIn: number
    username: string
    rol: Rol
}

export interface Usuario{
    id: number
    username: string
    nombre: string
    rol: Rol
    activo: boolean
}

export interface AuthSession {
    accessToken: string
    username: string
    rol: Rol
    expiresAt: number
}

export function toAuthSession(response: LoginResponse):AuthSession{
    return {
        accessToken: response.accessToken,
        username: response.username,
        rol: response.rol,
        expiresAt: Date.now() + response.expiresIn * 1000
    }
}