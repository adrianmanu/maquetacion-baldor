import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { OfflineBanner } from '../components/AppChrome'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import type { AnswerMode, Topic } from '../types'
import './Backoffice.css'

const emptyForm = (): Topic => ({
  id: '',
  title: '',
  category: 'Aritmética',
  answerMode: 'escrito',
  whatIs: '',
  howToSolve: '',
  example: '',
  videoUrl: '',
  videoTitle: '',
  prerequisiteIds: [],
})

export function BackofficePage() {
  const { topics, upsertTopic, deleteTopic } = useApp()
  const { user, logout } = useAuth()
  const [form, setForm] = useState<Topic>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const isEdit = Boolean(editingId)
  const sorted = useMemo(
    () => [...topics].sort((a, b) => a.title.localeCompare(b.title, 'es')),
    [topics],
  )

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setSaved(false)
  }

  function startEdit(topic: Topic) {
    setEditingId(topic.id)
    setForm({ ...topic })
    setSaved(false)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id =
      editingId ??
      form.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    if (!id || !form.title.trim()) return

    upsertTopic({
      ...form,
      id,
      videoTitle: form.videoTitle || `Cómo se resuelve: ${form.title}`,
      prerequisiteIds: form.prerequisiteIds ?? [],
    })
    setEditingId(id)
    setForm((f) => ({ ...f, id }))
    setSaved(true)
  }

  return (
    <div className="bo">
      <OfflineBanner />
      <header className="bo__top">
        <div>
          <p className="bo__brand">Baldor · Backoffice</p>
          <h1>Alimentar contenido del temario</h1>
          <p>
            Sesión: {user?.name}. Define qué es, cómo se resuelve, video y prerrequisitos.
          </p>
        </div>
        <div className="bo__top-actions">
          <Link to="/" className="btn btn--ghost">
            Inicio
          </Link>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="bo__grid">
        <section className="bo__list">
          <div className="bo__list-head">
            <h2>Temas ({sorted.length})</h2>
            <button type="button" className="btn btn--small" onClick={startCreate}>
              Nuevo tema
            </button>
          </div>
          <ul>
            {sorted.map((topic) => (
              <li key={topic.id}>
                <button
                  type="button"
                  className={editingId === topic.id ? 'bo__item is-active' : 'bo__item'}
                  onClick={() => startEdit(topic)}
                >
                  <strong>{topic.title}</strong>
                  <span>
                    {topic.category} ·{' '}
                    {topic.answerMode === 'escrito' ? 'Escrito' : 'Opción múltiple'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="bo__editor">
          <h2>{isEdit ? 'Editar tema' : 'Crear tema'}</h2>
          <form onSubmit={onSubmit} className="bo__form">
            <label>
              Título
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <div className="bo__row">
              <label>
                Categoría
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>Aritmética</option>
                  <option>Álgebra</option>
                  <option>Geometría</option>
                </select>
              </label>
              <label>
                Modo de respuesta
                <select
                  value={form.answerMode}
                  onChange={(e) =>
                    setForm({ ...form, answerMode: e.target.value as AnswerMode })
                  }
                >
                  <option value="escrito">Escrito (enteros)</option>
                  <option value="opcion_multiple">Opción múltiple</option>
                </select>
              </label>
            </div>

            <label>
              ¿Qué es?
              <textarea
                rows={3}
                value={form.whatIs}
                onChange={(e) => setForm({ ...form, whatIs: e.target.value })}
                required
              />
            </label>
            <label>
              ¿Cómo se resuelve?
              <textarea
                rows={4}
                value={form.howToSolve}
                onChange={(e) => setForm({ ...form, howToSolve: e.target.value })}
                required
              />
            </label>
            <label>
              Ejemplo
              <input
                value={form.example}
                onChange={(e) => setForm({ ...form, example: e.target.value })}
                required
              />
            </label>
            <label>
              Título del video
              <input
                value={form.videoTitle}
                onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                placeholder="Cómo se resuelve..."
              />
            </label>
            <label>
              URL embed del video (YouTube/Santillana)
              <input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
              />
            </label>
            <label>
              Prerrequisitos (ids separados por coma)
              <input
                value={form.prerequisiteIds.join(',')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prerequisiteIds: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="sumas,restas"
              />
            </label>

            <div className="bo__form-actions">
              <button type="submit" className="btn btn--primary">
                {isEdit ? 'Guardar cambios' : 'Crear contenido'}
              </button>
              {isEdit ? (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => {
                    deleteTopic(form.id)
                    startCreate()
                  }}
                >
                  Eliminar
                </button>
              ) : null}
            </div>
            {saved ? <p className="bo__ok">Contenido guardado.</p> : null}
          </form>
        </section>
      </div>
    </div>
  )
}
