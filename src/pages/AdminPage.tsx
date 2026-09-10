import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { OfflineBanner } from '../components/AppChrome'
import { useAuth } from '../context/AuthContext'
import type { Role, UserAccount } from '../types'
import './Admin.css'

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  docente: 'Docente',
  estudiante: 'Estudiante',
  padre: 'Padre',
  backoffice: 'Backoffice',
}

export function AdminPage() {
  const { user, users, upsertUser, setUserActive, logout } = useAuth()
  const students = useMemo(() => users.filter((u) => u.role === 'estudiante'), [users])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'colegio123',
    role: 'estudiante' as Role,
    grade: '3° Secundaria A',
    childId: '',
  })
  const [msg, setMsg] = useState('')

  function createUser(e: React.FormEvent) {
    e.preventDefault()
    const id = `u-${Date.now()}`
    const account: UserAccount = {
      id,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      active: true,
      grade: form.role === 'estudiante' ? form.grade : undefined,
      childIds: form.role === 'padre' && form.childId ? [form.childId] : undefined,
    }
    if (users.some((u) => u.email === account.email)) {
      setMsg('Ese correo ya existe.')
      return
    }
    upsertUser(account)
    setMsg(`Usuario ${account.name} creado.`)
    setForm((f) => ({ ...f, name: '', email: '' }))
  }

  return (
    <div className="admin">
      <OfflineBanner />
      <header className="admin__top">
        <div>
          <p className="admin__brand">Baldor · Admin colegio</p>
          <h1>Usuarios y roles</h1>
          <p>Sesión: {user?.name}</p>
        </div>
        <div className="admin__top-actions">
          <Link to="/" className="btn btn--ghost">
            Inicio
          </Link>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="admin__grid">
        <section className="admin__card">
          <h2>Crear usuario</h2>
          <form className="form-stack" onSubmit={createUser}>
            <label>
              Nombre
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Contraseña temporal
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            <label>
              Rol
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              >
                <option value="docente">Docente</option>
                <option value="estudiante">Estudiante</option>
                <option value="padre">Padre / madre</option>
                <option value="backoffice">Backoffice</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {form.role === 'estudiante' ? (
              <label>
                Grado / sección
                <input
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                />
              </label>
            ) : null}
            {form.role === 'padre' ? (
              <label>
                Hijo/a vinculado
                <select
                  value={form.childId}
                  onChange={(e) => setForm({ ...form, childId: e.target.value })}
                  required
                >
                  <option value="">Selecciona estudiante</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button type="submit" className="btn btn--primary">
              Crear cuenta
            </button>
            {msg ? <p className="admin__ok">{msg}</p> : null}
          </form>
        </section>

        <section className="admin__card">
          <h2>Directorio ({users.length})</h2>
          <ul className="admin__list">
            {users.map((u) => (
              <li key={u.id}>
                <div>
                  <strong>{u.name}</strong>
                  <span>
                    {roleLabels[u.role]} · {u.email}
                    {u.grade ? ` · ${u.grade}` : ''}
                    {!u.active ? ' · inactivo' : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => setUserActive(u.id, !u.active)}
                >
                  {u.active ? 'Desactivar' : 'Activar'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
