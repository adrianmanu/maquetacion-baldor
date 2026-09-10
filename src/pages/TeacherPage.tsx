import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { TopicPanel } from '../components/TopicPanel'
import { Modal } from '../components/Modal'
import { OfflineBanner } from '../components/AppChrome'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { generateEvalCode, generateExercises } from '../utils/exercises'
import { downloadExercisesPdf } from '../utils/pdf'
import { exportActasCsv, exportActasPdf } from '../utils/actas'
import type { Difficulty } from '../types'
import './RoleShell.css'

function difficultyLabel(d: Difficulty) {
  if (d === 'facil') return 'Fácil'
  if (d === 'medio') return 'Medio'
  return 'Difícil'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function SessionBar() {
  const { user, logout } = useAuth()
  return (
    <div className="session-bar">
      <span>{user?.name} · Docente</span>
      <button type="button" className="btn btn--small" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  )
}

function TeacherWelcome() {
  const { evaluations, getSubmissionsByCode } = useApp()
  const navigate = useNavigate()
  const recent = evaluations.slice(0, 3)

  return (
    <div className="shell__welcome">
      <h1>Temario docente</h1>
      <p>Selecciona un tema para ver contenido, generar material o revisar evaluaciones.</p>
      {recent.length > 0 ? (
        <div className="teacher-recent">
          <h2>Evaluaciones recientes</h2>
          <ul>
            {recent.map((ev) => {
              const count = getSubmissionsByCode(ev.code).length
              return (
                <li key={ev.code}>
                  <button
                    type="button"
                    className="teacher-recent__item"
                    onClick={() => navigate(`/docente/evaluaciones/${ev.code}`)}
                  >
                    <strong>{ev.topicTitle}</strong>
                    <span>
                      Código {ev.code} · {count} entrega{count === 1 ? '' : 's'}
                      {ev.closed ? ' · CERRADA' : ''}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/docente/evaluaciones')}
          >
            Ver todas las evaluaciones
          </button>
        </div>
      ) : null}
    </div>
  )
}

function TeacherTopic() {
  const { topicId } = useParams()
  const { topics } = useApp()
  const navigate = useNavigate()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic) {
    return <p className="shell__empty">Tema no encontrado. Elige otro en el temario.</p>
  }

  return (
    <TopicPanel
      topic={topic}
      actions={
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate(`/docente/tema/${topic.id}/acciones`)}
        >
          Ir a generar material →
        </button>
      }
    />
  )
}

function TeacherActions() {
  const { topicId } = useParams()
  const { topics, addEvaluation } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const topic = topics.find((t) => t.id === topicId)

  const [exercisesOpen, setExercisesOpen] = useState(false)
  const [evalOpen, setEvalOpen] = useState(false)
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState<Difficulty>('medio')
  const [evalCount, setEvalCount] = useState(5)
  const [evalDifficulty, setEvalDifficulty] = useState<Difficulty>('medio')
  const [timeLimit, setTimeLimit] = useState(20)
  const [expiresInDays, setExpiresInDays] = useState(3)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  if (!topic) return <Navigate to="/docente" replace />

  function handleGenerateExercises(e: React.FormEvent) {
    e.preventDefault()
    const exercises = generateExercises(topic!, count, difficulty)
    downloadExercisesPdf(topic!, exercises, 'problemas')
    downloadExercisesPdf(topic!, exercises, 'solucionario')
    setExercisesOpen(false)
  }

  function handleGenerateEval(e: React.FormEvent) {
    e.preventDefault()
    const exercises = generateExercises(topic!, evalCount, evalDifficulty)
    const code = generateEvalCode()
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    ).toISOString()
    addEvaluation({
      code,
      topicId: topic!.id,
      topicTitle: topic!.title,
      difficulty: evalDifficulty,
      exercises,
      createdAt: new Date().toISOString(),
      expiresAt,
      timeLimitMinutes: timeLimit,
      closed: false,
      createdBy: user?.id ?? 'u-docente',
    })
    setGeneratedCode(code)
  }

  return (
    <div className="actions-page">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => navigate(`/docente/tema/${topic.id}`)}
      >
        ← Volver al contenido
      </button>
      <h1>Material de {topic.title}</h1>
      <p className="actions-page__lead">
        Genera PDFs o una evaluación con tiempo, vencimiento y un solo intento.
      </p>

      <div className="actions-page__grid">
        <button type="button" className="action-tile" onClick={() => setExercisesOpen(true)}>
          <span className="action-tile__title">Generar ejercicios</span>
          <span className="action-tile__desc">
            Cantidad + dificultad. PDF de problemas y solucionario.
          </span>
        </button>
        <button
          type="button"
          className="action-tile action-tile--alt"
          onClick={() => {
            setGeneratedCode(null)
            setEvalOpen(true)
          }}
        >
          <span className="action-tile__title">Generar evaluación</span>
          <span className="action-tile__desc">
            Código con vencimiento, límite de tiempo y cierre de aula.
          </span>
        </button>
      </div>

      <Modal open={exercisesOpen} title="Generar ejercicios" onClose={() => setExercisesOpen(false)}>
        <form className="form-stack" onSubmit={handleGenerateExercises}>
          <label>
            Cantidad
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Dificultad
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="facil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="dificil">Difícil</option>
            </select>
          </label>
          <button type="submit" className="btn btn--primary">
            Descargar PDFs
          </button>
        </form>
      </Modal>

      <Modal
        open={evalOpen}
        title="Generar evaluación"
        onClose={() => {
          setEvalOpen(false)
          setGeneratedCode(null)
        }}
      >
        {generatedCode ? (
          <div className="code-result">
            <p>Evaluación creada (1 intento por estudiante):</p>
            <p className="code-result__code">{generatedCode}</p>
            <div className="code-result__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigator.clipboard?.writeText(generatedCode)}
              >
                Copiar código
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setEvalOpen(false)
                  navigate(`/docente/evaluaciones/${generatedCode}`)
                }}
              >
                Ver prueba y actas
              </button>
            </div>
          </div>
        ) : (
          <form className="form-stack" onSubmit={handleGenerateEval}>
            <label>
              Cantidad de ejercicios
              <input
                type="number"
                min={1}
                max={30}
                value={evalCount}
                onChange={(e) => setEvalCount(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Dificultad
              <select
                value={evalDifficulty}
                onChange={(e) => setEvalDifficulty(e.target.value as Difficulty)}
              >
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
              </select>
            </label>
            <label>
              Tiempo límite (minutos)
              <input
                type="number"
                min={5}
                max={120}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Vence en (días)
              <input
                type="number"
                min={1}
                max={30}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                required
              />
            </label>
            <p className="form-hint">Los estudiantes solo tendrán 1 intento.</p>
            <button type="submit" className="btn btn--primary">
              Generar y obtener código
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}

function TeacherEvaluationsList() {
  const { evaluations, getSubmissionsByCode } = useApp()
  const navigate = useNavigate()

  return (
    <div className="actions-page">
      <h1>Mis evaluaciones</h1>
      <p className="actions-page__lead">
        Revisa la prueba, resultados, cierra el aula y exporta actas.
      </p>
      {evaluations.length === 0 ? (
        <p className="shell__empty">Aún no hay evaluaciones.</p>
      ) : (
        <ul className="eval-list">
          {evaluations.map((ev) => {
            const subs = getSubmissionsByCode(ev.code)
            const avg =
              subs.length === 0
                ? null
                : Math.round(
                    subs.reduce((sum, s) => sum + s.scorePercent, 0) / subs.length,
                  )
            return (
              <li key={ev.code}>
                <button
                  type="button"
                  className="eval-list__item"
                  onClick={() => navigate(`/docente/evaluaciones/${ev.code}`)}
                >
                  <div>
                    <strong>{ev.topicTitle}</strong>
                    <span>
                      {ev.code} · {difficultyLabel(ev.difficulty)} ·{' '}
                      {ev.timeLimitMinutes} min · vence {formatDate(ev.expiresAt)}
                      {ev.closed ? ' · CERRADA' : ''}
                    </span>
                  </div>
                  <div className="eval-list__stats">
                    <span>{subs.length} entregas</span>
                    <span>{avg === null ? 'Sin notas' : `Promedio ${avg}%`}</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function TeacherEvaluationDetail() {
  const { code } = useParams()
  const { getEvaluationByCode, getSubmissionsByCode, updateEvaluation, isEvaluationOpen } =
    useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'prueba' | 'resultados'>('prueba')
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)

  const evaluation = useMemo(
    () => (code ? getEvaluationByCode(code) : undefined),
    [code, getEvaluationByCode],
  )
  const submissions = useMemo(
    () => (code ? getSubmissionsByCode(code) : []),
    [code, getSubmissionsByCode],
  )
  const selected = submissions.find((s) => s.id === selectedSubId)
  const status = evaluation ? isEvaluationOpen(evaluation) : null

  if (!evaluation) {
    return (
      <div className="actions-page">
        <p className="shell__empty">Evaluación no encontrada.</p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate('/docente/evaluaciones')}
        >
          Volver
        </button>
      </div>
    )
  }

  const avg =
    submissions.length === 0
      ? null
      : Math.round(
          submissions.reduce((sum, s) => sum + s.scorePercent, 0) / submissions.length,
        )

  return (
    <div className="actions-page exam-page">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => navigate('/docente/evaluaciones')}
      >
        ← Mis evaluaciones
      </button>

      <p className="exam-page__meta">
        Código {evaluation.code} · {difficultyLabel(evaluation.difficulty)} ·{' '}
        {evaluation.timeLimitMinutes} min
      </p>
      <h1>{evaluation.topicTitle}</h1>
      <p className="actions-page__lead">
        Creada {formatDate(evaluation.createdAt)} · Vence {formatDate(evaluation.expiresAt)} ·{' '}
        {status?.open ? 'Aula abierta' : status?.reason}
      </p>

      <div className="toolbar-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => exportActasPdf(evaluation, submissions)}
        >
          Exportar acta PDF
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => exportActasCsv(evaluation, submissions)}
        >
          Exportar acta Excel (CSV)
        </button>
        <button
          type="button"
          className="btn btn--danger"
          onClick={() =>
            updateEvaluation(evaluation.code, { closed: !evaluation.closed })
          }
        >
          {evaluation.closed ? 'Reabrir aula' : 'Cerrar aula'}
        </button>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'prueba' ? 'tabs__btn is-active' : 'tabs__btn'}
          onClick={() => setTab('prueba')}
        >
          Ver prueba
        </button>
        <button
          type="button"
          className={tab === 'resultados' ? 'tabs__btn is-active' : 'tabs__btn'}
          onClick={() => setTab('resultados')}
        >
          Resultados ({submissions.length})
          {avg !== null ? ` · ${avg}%` : ''}
        </button>
      </div>

      {tab === 'prueba' ? (
        <ol className="exam-preview">
          {evaluation.exercises.map((ex, i) => (
            <li key={ex.id}>
              <p className="exam-preview__prompt">
                {i + 1}. {ex.prompt}
              </p>
              {ex.options?.length ? (
                <ul className="exam-preview__options">
                  {ex.options.map((opt) => (
                    <li key={opt} className={opt === ex.answer ? 'is-answer' : undefined}>
                      {opt}
                      {opt === ex.answer ? ' (correcta)' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="exam-preview__answer">Respuesta: {ex.answer}</p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div className="results-panel">
          {submissions.length === 0 ? (
            <p className="shell__empty">Todavía no hay entregas.</p>
          ) : (
            <>
              <ul className="results-table">
                {submissions.map((sub) => (
                  <li key={sub.id}>
                    <button
                      type="button"
                      className={
                        selectedSubId === sub.id
                          ? 'results-table__row is-active'
                          : 'results-table__row'
                      }
                      onClick={() =>
                        setSelectedSubId((id) => (id === sub.id ? null : sub.id))
                      }
                    >
                      <strong>{sub.studentName}</strong>
                      <span>{formatDate(sub.submittedAt)}</span>
                      <span>
                        {sub.correct}/{sub.total}
                      </span>
                      <span className="results-table__score">{sub.scorePercent}%</span>
                    </button>
                  </li>
                ))}
              </ul>
              {selected ? (
                <div className="result-detail">
                  <h2>Detalle de {selected.studentName}</h2>
                  <ul>
                    {selected.answers.map((a, i) => (
                      <li key={a.exerciseId} className={a.correct ? 'is-ok' : 'is-bad'}>
                        <p>
                          <strong>
                            {i + 1}. {a.prompt}
                          </strong>
                        </p>
                        <p>
                          Respuesta: {a.userAnswer || '—'}{' '}
                          {a.correct ? '✓' : `✗ (esperada: ${a.expected})`}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="form-hint">Haz clic en un estudiante para ver el detalle.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function TeacherPage() {
  const { topics } = useApp()

  return (
    <div className="shell">
      <Sidebar
        topics={topics}
        basePath="/docente"
        title="Rol docente"
        extraLinks={[{ to: '/docente/evaluaciones', label: 'Mis evaluaciones' }]}
      />
      <div className="shell__content">
        <OfflineBanner />
        <SessionBar />
        <main className="shell__main">
          <Routes>
            <Route index element={<TeacherWelcome />} />
            <Route path="evaluaciones" element={<TeacherEvaluationsList />} />
            <Route path="evaluaciones/:code" element={<TeacherEvaluationDetail />} />
            <Route path="tema/:topicId" element={<TeacherTopic />} />
            <Route path="tema/:topicId/acciones" element={<TeacherActions />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
