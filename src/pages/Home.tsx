import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

export function Home() {
  const { user, homeFor, logout } = useAuth()

  return (
    <main className="home">
      <div className="home__atmosphere" aria-hidden="true" />
      <section className="home__hero">
        <p className="home__brand">Baldor</p>
        <h1>Aula digital de matemáticas para el colegio</h1>
        <p className="home__lead">
          Contenido, práctica, evaluaciones con tiempo y actas. Funciona también
          offline.
        </p>
        {user ? (
          <div className="home__session">
            <p>
              Sesión activa: <strong>{user.name}</strong> ({user.role})
            </p>
            <div className="home__cta-row">
              <Link to={homeFor(user.role)} className="btn btn--primary">
                Ir a mi panel
              </Link>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <div className="home__cta-row">
            <Link to="/login" className="btn btn--primary">
              Iniciar sesión
            </Link>
          </div>
        )}
      </section>

      <section className="home__roles" aria-label="Roles del sistema">
        <article className="home__role tone-a">
          <span className="home__role-label">Admin colegio</span>
          <span className="home__role-desc">
            Alta de docentes, estudiantes y padres. Activar o desactivar cuentas.
          </span>
        </article>
        <article className="home__role tone-b">
          <span className="home__role-label">Docente</span>
          <span className="home__role-desc">
            Temario, PDFs, evaluaciones con vencimiento, cierre de aula y export de actas.
          </span>
        </article>
        <article className="home__role tone-c">
          <span className="home__role-label">Estudiante / Padres</span>
          <span className="home__role-desc">
            Estudio con video, práctica con refuerzo, exámenes de 1 intento y resumen familiar.
          </span>
        </article>
      </section>
    </main>
  )
}
