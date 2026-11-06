/** API pública del módulo auth: el resto de la app solo importa desde aquí. */
export { LoginForm } from "./components/LoginForm";
export { ProtectedRoute } from "./components/ProtectedRoute";
export { PublicOnlyRoute } from "./components/PublicOnlyRoute";
export { useAuth } from "./hooks/useAuth";
export { useCurrentUser } from "./hooks/useCurrentUser";
export { sessionStore } from "./lib/sessionStore";
export type { Rol, Usuario } from "./model/types";
