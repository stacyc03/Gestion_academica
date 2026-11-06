/**
 * Store de sesión fuera de REACT (patrón external  store)
 * - Fuente única de verdad del token.
 * - Cierra la sesión automáticamente cuando el token expira.
 * - React se suscribe con useSyncExternalStore(ver useAuth)
 */

import type { AuthSession } from "../model/types"

const STORAGE_KEY = 'gestion-academica.session'

type Listener = () => void

const listeners = new Set<Listener>()

let expiryTimer: ReturnType<typeof setTimeout> | undefined
let current: AuthSession | null = load()

function load(): AuthSession | null{
    try{
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if(!raw) return null
        const session = JSON.parse(raw) as AuthSession
        return session.expiresAt > Date.now() ? session : null
    }
    catch{
        return null
    }
}

function persist(session: AuthSession | null){
    try{
        if(session){
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
        }else{
            sessionStorage.removeItem(STORAGE_KEY)
        }
    }
    catch{
        // Almacenamiento no disponible (modo privado estricto): la sesión vive solo en memoria.
    }
}

function scheduleExpiry(){
    clearTimeout(expiryTimer)
    if(current){
        expiryTimer = setTimeout(() => sessionStore.clear(), current.expiresAt - Date.now())
    }
}

function emit(){
    listeners.forEach((listener) => listener())
}

export const sessionStore = {
    get(): AuthSession | null{
        return current
    },

    set(session: AuthSession){
        current = session
        persist(session)
        scheduleExpiry()
        emit()
    },

    clear(){
        if(!current) return
        current = null
        persist(null)
        scheduleExpiry()
        emit()
    },

    subscribe(listener: Listener): () => void{
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    },
}

scheduleExpiry()