import { useSyncExternalStore } from "react"
import { sessionStore } from "../lib/sessionStore"
import type { Rol } from "../model/types"

export function useAuth(){
    const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.get)

    return {
        session,
        isAuthenticated: session !== null,
        hasRole: (...roles: Rol[]) => session !== null && roles.includes(session.rol),
        logout: sessionStore.clear,
    }
}