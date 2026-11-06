import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute, PublicOnlyRoute } from "@/features/auth";
import { DashboardPage } from "@/pages/DashboardPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import { LoginPage } from "@/pages/LoginPage";

export const router = createBrowserRouter([
    {
        Component: PublicOnlyRoute,
        children: [{ path: '/login', Component: LoginPage }],
    },
    {
        Component: ProtectedRoute,
        children: [{ path: '/', Component: DashboardPage }],
    },
    // Ejemplo de ruta restringida por rol:
    // { element: <ProtectedRoute allowedRoles={['ADMIN']} />, children: [{ path: '/usuarios', Component: UsuariosPage }] },
    { path: '/forbidden', Component: ForbiddenPage },
    { path: '*', element: <Navigate to="/" replace /> },
])
