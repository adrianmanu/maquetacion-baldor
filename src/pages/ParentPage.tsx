import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { OfflineBanner } from '../components/AppChrome'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import './Parent.css'

function startOfWeek(d = new Date()) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x
}

export function ParentPage() {
  const { user, users, logout } = useAuth()
  const { submissions, evaluations, topics } = useApp()

  const children = useMemo(
    () => users.filter((u) => user?.childIds?.includes(u.id)),
    [users, user],
  )

  const weekStart = startOfWeek()

  const weekly = useMemo(() => {
    return children.map((child) => {
      const childSubs = submissions.filter(
        (s) =>
          s.studentId === child.id &&
          new Date(s.submittedAt).getTime() >= weekStart.getTime(),
      )
      const avg =
        childSubs.length === 0
          ? null
          : Math.round(
              childSubs.reduce((a, s) => a + s.scorePercent, 0) / childSubs.length,
            )
      const byTopic = childSubs.map((s) => {
        const ev = evaluations.find(
          (e) => e.code.toUpperCase() === s.evaluationCode.toUpperCase(),
        )
        return {
          topic: ev?.topicTitle ?? s.evaluationCode,
          score: s.scorePercent,
          date: new Date(s.submittedAt).toLocaleDateString('es-ES'),
        }
      })
      return { child, avg, count: childSubs.length, byTopic }
    })
  }, [children, submissions, evaluations, weekStart])

  return (
    <div className="parent">
      <OfflineBanner />
      <header className="parent__top">
        <div>
          <p className="parent__brand">Baldor · Familia</p>
          <h1>Resumen semanal</h1>
          <p>
            Hola {user?.name}. Progreso de{' '}
            {children.map((c) => c.name).join(', ') || 'tus hijos'} esta semana.
          </p>
        </div>
        <div className="parent__actions">
          <Link to="/" className="btn btn--ghost">
            Inicio
          </Link>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="parent__main">
        {weekly.length === 0 ? (
          <p>No hay hijos vinculados a esta cuenta.</p>
        ) : (
          weekly.map(({ child, avg, count, byTopic }) => (
            <section key={child.id} className="parent__card">
              <h2>{child.name}</h2>
              <p className="parent__meta">{child.grade}</p>
              <div className="parent__stats">
                <div>
                  <strong>{count}</strong>
                  <span>evaluaciones esta semana</span>
                </div>
                <div>
                  <strong>{avg === null ? '—' : `${avg}%`}</strong>
                  <span>promedio semanal</span>
                </div>
                <div>
                  <strong>{topics.length}</strong>
                  <span>temas disponibles</span>
                </div>
              </div>

              <h3>Detalle de la semana</h3>
              {byTopic.length === 0 ? (
                <p className="parent__empty">
                  Aún no rindió evaluaciones esta semana. Anímale a practicar en
                  Baldor.
                </p>
              ) : (
                <ul>
                  {byTopic.map((row, i) => (
                    <li key={`${row.topic}-${i}`}>
                      <strong>{row.topic}</strong>
                      <span>
                        {row.date} · {row.score}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))
        )}
      </main>
    </div>
  )
}
