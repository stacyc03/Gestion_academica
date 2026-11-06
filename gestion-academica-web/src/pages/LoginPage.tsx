import { LoginForm } from "@/features/auth";

export function LoginPage() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
            <section className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
                <h1 className="mb-1 text-2xl font-semibold text-slate-900">Gestión Académica</h1>
                <p className="mb-6 text-sm text-slate-500">Inicia sesión para continuar</p>
                <LoginForm />
            </section>
        </main>
    )
}
