import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const demos = [
  { role: 'Admin', email: 'admin@colegio.edu', pass: 'admin123' },
  { role: 'Docente', email: 'docente@colegio.edu', pass: 'doc123' },
  { role: 'Estudiante', email: 'estudiante@colegio.edu', pass: 'est123' },
  { role: 'Padre', email: 'padre@colegio.edu', pass: 'pad123' },
  { role: 'Backoffice', email: 'contenido@santillana.com', pass: 'back123' },
]

export function LoginPage() {
  const { user, login, homeFor } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('estudiante@colegio.edu')
  const [password, setPassword] = useState('est123')
  const [error, setError] = useState('')

  if (user) return <Navigate to={homeFor(user.role)} replace />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const from = (location.state as { from?: string } | null)?.from
    navigate(from && from !== '/login' ? from : result.home, { replace: true })
  }

  return (
    <div className="login">
      <main className="login__main">
        <section className="login__hero">
          <p className="login__brand">Baldor</p>
          <h1>Ingreso al aula digital del colegio</h1>
          <p>
            Roles: administración, docentes, estudiantes, padres y backoffice de
            contenido.
          </p>
        </section>

        <section className="login__panel" aria-label="Formulario de acceso">
          <h2>Iniciar sesion</h2>
          <form className="form-stack" onSubmit={onSubmit}>
            <label>
              Correo
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button type="submit" className="btn btn--primary">
              Entrar
            </button>
          </form>

          <div className="login__demos">
            <p>Cuentas demo (clic para rellenar):</p>
            <ul>
              {demos.map((d) => (
                <li key={d.email}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(d.email)
                      setPassword(d.pass)
                      setError('')
                    }}
                  >
                    {d.role}: {d.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Link to="/" className="login__back">
            Volver al inicio
          </Link>
        </section>
      </main>
    </div>
  )
}
