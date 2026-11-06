import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { Rol } from "../model/types";

interface ProtectedRouteProps {
    /** Si se omite, basta con estar autenticado. */
    allowedRoles?: Rol[]
}

/**
 * Guard de rutas: es solo UX. La seguridad real la aplica el backend
 * (JWT + @PreAuthorize). Nunca confíes en el cliente para autorizar.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, hasRole } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    if (allowedRoles && !hasRole(...allowedRoles)) {
        return <Navigate to="/forbidden" replace />
    }

    return <Outlet />
}
