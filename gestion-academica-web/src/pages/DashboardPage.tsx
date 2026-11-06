import { useAuth } from '@/features/auth'
import { EstudiantesPanel } from '@/features/estudiantes/components/EstudiantesPanel'
export function DashboardPage() {
  const { session, logout } = useAuth()
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">GA</span><span>Gestión Académica<small>Portal de consulta</small></span></div><div className="account"><span>{session?.username}<small>{session?.rol}</small></span><button className="secondary" onClick={logout}>Cerrar sesión</button></div></header>
    <main className="workspace"><div className="page-heading"><span className="eyebrow">COMUNIDAD UNIVERSITARIA</span><h1>Consulta de estudiantes</h1><p>Explora los registros académicos y consulta la información de cada estudiante.</p></div><EstudiantesPanel /></main>
    <footer className="footer">Gestión Académica · Servicios Web · Sesión 12</footer>
  </div>
}
