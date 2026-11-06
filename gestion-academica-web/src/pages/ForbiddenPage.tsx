import { Link } from "react-router";

export function ForbiddenPage() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4">
            <h1 className="text-2xl font-semibold">Acceso denegado</h1>
            <p className="text-slate-500">No tienes permisos para ver esta página.</p>
            <Link to="/" className="text-indigo-600 hover:underline">
                Volver al inicio
            </Link>
        </main>
    )
}
