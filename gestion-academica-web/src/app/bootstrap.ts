import { sessionStore } from "@/features/auth";
import { configureHttpClient } from "@/shared/api/httpClient";
import { queryClient } from "./queryClient";

/**
 * Composition root: aquí se conectan los módulos (como la inyección de dependencias en Spring).
 * Se ejecuta una sola vez, antes de renderizar.
 */
configureHttpClient({
    getToken: () => sessionStore.get()?.accessToken ?? null,
    onUnauthorized: () => sessionStore.clear(),
})

// Al cerrar sesión se borra la caché para no dejar datos del usuario anterior.
sessionStore.subscribe(() => {
    if (!sessionStore.get()) {
        queryClient.clear()
    }
})
