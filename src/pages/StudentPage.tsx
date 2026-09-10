import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { TopicPanel } from '../components/TopicPanel'
import { Modal } from '../components/Modal'
import { ReinforcementCard } from '../components/ReinforcementCard'
import { OfflineBanner } from '../components/AppChrome'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { generateExercises } from '../utils/exercises'
import type { Difficulty, Exercise, PracticeResult, ReinforcementPlan } from '../types'
import './RoleShell.css'

function SessionBar() {
  const { user, logout } = useAuth()
  return (
    <div className="session-bar">
      <span>
        {user?.name} · Estudiante{user?.grade ? ` · ${user.grade}` : ''}
      </span>
      <button type="button" className="btn btn--small" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  )
}

function StudentWelcome() {
  const { getLatestReinforcement } = useApp()
  const navigate = useNavigate()
  const plan = getLatestReinforcement()

  return (
    <div className="shell__welcome">
      <h1>Temario estudiante</h1>
      <p>Elige un tema para estudiar, o entra directo al examen con el código del docente.</p>

      <button
        type="button"
        className="btn btn--primary exam-quick-btn"
        onClick={() => navigate('/estudiante/ingresar-examen')}
      >
        Ingresar código de examen
      </button>

      {plan ? <ReinforcementCard plan={plan} basePath="/estudiante" /> : null}
    </div>
  )
}

function EnterExamByCode() {
  const { getEvaluationByCode, isEvaluationOpen, hasStudentAttempted } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [examCode, setExamCode] = useState('')
  const [examError, setExamError] = useState('')
  const [detected, setDetected] = useState<{
    code: string
    topicTitle: string
    timeLimitMinutes: number
    expiresAt: string
  } | null>(null)

  function detectCode(value: string) {
    const code = value.trim().toUpperCase()
    setExamCode(code)
    setExamError('')
    if (code.length < 4) {
      setDetected(null)
      return
    }
    const evaluation = getEvaluationByCode(code)
    if (!evaluation) {
      setDetected(null)
      return
    }
    setDetected({
      code: evaluation.code,
      topicTitle: evaluation.topicTitle,
      timeLimitMinutes: evaluation.timeLimitMinutes,
      expiresAt: evaluation.expiresAt,
    })
  }

  function enterExam(e: React.FormEvent) {
    e.preventDefault()
    const evaluation = getEvaluationByCode(examCode.trim())
    if (!evaluation) {
      setExamError('Código no encontrado. Revisa con tu docente.')
      setDetected(null)
      return
    }
    const open = isEvaluationOpen(evaluation)
    if (!open.open) {
      setExamError(open.reason ?? 'Evaluación no disponible.')
      return
    }
    if (user && hasStudentAttempted(evaluation.code, user.id)) {
      setExamError('Ya usaste tu único intento en esta evaluación.')
      return
    }
    navigate(`/estudiante/examen/${evaluation.code}`)
  }

  return (
    <div className="actions-page">
      <button type="button" className="btn btn--ghost" onClick={() => navigate('/estudiante')}>
        ← Volver al temario
      </button>
      <h1>Ingresar al examen</h1>
      <p className="actions-page__lead">
        Escribe el código que te compartió tu docente. Se detectará la prueba y te llevará
        directo a rendirla.
      </p>

      <form className="form-stack exam-code-form" onSubmit={enterExam}>
        <label>
          Código de evaluación
          <input
            value={examCode}
            onChange={(e) => detectCode(e.target.value)}
            placeholder="Ej. A3K9MP"
            required
            maxLength={8}
            autoFocus
            autoComplete="off"
          />
        </label>

        {detected ? (
          <div className="exam-detected" role="status">
            <p>
              <strong>Prueba detectada:</strong> {detected.topicTitle}
            </p>
            <p>
              Código {detected.code} · {detected.timeLimitMinutes} min · vence{' '}
              {new Date(detected.expiresAt).toLocaleString('es-ES')}
            </p>
          </div>
        ) : examCode.length >= 4 ? (
          <p className="form-hint">No hay una evaluación con ese código todavía.</p>
        ) : null}

        {examError ? <p className="form-error">{examError}</p> : null}

        <button type="submit" className="btn btn--primary">
          Entrar a la prueba
        </button>
      </form>
    </div>
  )
}

function StudentTopic() {
  const { topicId } = useParams()
  const { topics } = useApp()
  const navigate = useNavigate()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic) {
    return <p className="shell__empty">Tema no encontrado.</p>
  }

  return (
    <TopicPanel
      topic={topic}
      actions={
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate(`/estudiante/tema/${topic.id}/acciones`)}
        >
          Ir a practicar o examinar →
        </button>
      }
    />
  )
}

function ExerciseForm({
  exercises,
  topicAnswerMode,
  onSubmit,
  submitLabel,
}: {
  exercises: Exercise[]
  topicAnswerMode: 'escrito' | 'opcion_multiple'
  onSubmit: (answers: Record<string, string>) => void
  submitLabel: string
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  return (
    <form
      className="exam-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(answers)
      }}
    >
      {exercises.map((ex, i) => {
        const mode = ex.options?.length ? 'opcion_multiple' : topicAnswerMode
        return (
          <fieldset key={ex.id} className="exam-item">
            <legend>
              {i + 1}. {ex.prompt}
            </legend>
            {mode === 'opcion_multiple' && ex.options ? (
              <div className="exam-options">
                {ex.options.map((opt) => (
                  <label key={opt} className="exam-option">
                    <input
                      type="radio"
                      name={ex.id}
                      value={opt}
                      checked={answers[ex.id] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [ex.id]: opt }))}
                      required
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                placeholder="Escribe tu respuesta"
                value={answers[ex.id] ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [ex.id]: e.target.value }))}
                required
              />
            )}
          </fieldset>
        )
      })}
      <button type="submit" className="btn btn--primary">
        {submitLabel}
      </button>
    </form>
  )
}

function ResultBanner({ result }: { result: PracticeResult }) {
  const note = Math.round((result.correct / result.total) * 100)
  return (
    <div className="result-banner">
      <h2>Resultado</h2>
      <p className="result-banner__score">
        {result.correct} / {result.total} correctas · Nota {note}%
      </p>
      <ul>
        {result.answers.map((a, i) => (
          <li key={a.exerciseId} className={a.correct ? 'is-ok' : 'is-bad'}>
            Ejercicio {i + 1}:{' '}
            {a.correct ? 'Correcto' : `Incorrecto (tu respuesta: ${a.userAnswer || '—'})`}
          </li>
        ))}
      </ul>
    </div>
  )
}

function grade(exercises: Exercise[], answers: Record<string, string>): PracticeResult {
  const graded = exercises.map((ex) => {
    const userAnswer = (answers[ex.id] ?? '').trim()
    const correct =
      userAnswer.replace(/\s+/g, '').toLowerCase() ===
      ex.answer.replace(/\s+/g, '').toLowerCase()
    return { exerciseId: ex.id, userAnswer, correct }
  })
  return {
    total: exercises.length,
    correct: graded.filter((g) => g.correct).length,
    answers: graded,
  }
}

function StudentActions() {
  const { topicId } = useParams()
  const { topics, getEvaluationByCode, isEvaluationOpen, hasStudentAttempted, recordReinforcement } =
    useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const topic = topics.find((t) => t.id === topicId)

  const [practiceOpen, setPracticeOpen] = useState(false)
  const [examOpen, setExamOpen] = useState(false)
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState<Difficulty>('medio')
  const [practiceSet, setPracticeSet] = useState<Exercise[] | null>(null)
  const [practiceResult, setPracticeResult] = useState<PracticeResult | null>(null)
  const [practicePlan, setPracticePlan] = useState<ReinforcementPlan | null>(null)
  const [examCode, setExamCode] = useState('')
  const [examError, setExamError] = useState('')

  if (!topic) return <Navigate to="/estudiante" replace />

  function startPractice(e: React.FormEvent) {
    e.preventDefault()
    setPracticeSet(generateExercises(topic!, count, difficulty))
    setPracticeResult(null)
    setPracticePlan(null)
  }

  function finishPractice(answers: Record<string, string>) {
    const graded = grade(practiceSet!, answers)
    const pct = Math.round((graded.correct / graded.total) * 100)
    setPracticeResult(graded)
    setPracticePlan(recordReinforcement(topic!.id, pct))
  }

  function enterExam(e: React.FormEvent) {
    e.preventDefault()
    const evaluation = getEvaluationByCode(examCode.trim())
    if (!evaluation) {
      setExamError('Código no encontrado.')
      return
    }
    const open = isEvaluationOpen(evaluation)
    if (!open.open) {
      setExamError(open.reason ?? 'Evaluación no disponible.')
      return
    }
    if (user && hasStudentAttempted(evaluation.code, user.id)) {
      setExamError('Ya usaste tu único intento en esta evaluación.')
      return
    }
    setExamOpen(false)
    navigate(`/estudiante/examen/${evaluation.code}`)
  }

  return (
    <div className="actions-page">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => navigate(`/estudiante/tema/${topic.id}`)}
      >
        ← Volver al contenido
      </button>
      <h1>Actividades de {topic.title}</h1>
      <p className="actions-page__lead">
        Practica con refuerzo automático, o rinde examen (1 intento + tiempo límite).
      </p>

      <div className="actions-page__grid">
        <button
          type="button"
          className="action-tile"
          onClick={() => {
            setPracticeSet(null)
            setPracticeResult(null)
            setPracticePlan(null)
            setPracticeOpen(true)
          }}
        >
          <span className="action-tile__title">Practicar</span>
          <span className="action-tile__desc">
            Genera ejercicios, recibe nota y ruta de refuerzo si bajas de 70%.
          </span>
        </button>
        <button type="button" className="action-tile action-tile--alt" onClick={() => setExamOpen(true)}>
          <span className="action-tile__title">Ingresar al examen</span>
          <span className="action-tile__desc">
            Código del docente. Un intento. Tiempo y vencimiento controlados.
          </span>
        </button>
      </div>

      <Modal
        open={practiceOpen}
        title="Practicar"
        onClose={() => {
          setPracticeOpen(false)
          setPracticeSet(null)
          setPracticeResult(null)
          setPracticePlan(null)
        }}
      >
        {!practiceSet ? (
          <form className="form-stack" onSubmit={startPractice}>
            <label>
              Cantidad
              <input
                type="number"
                min={1}
                max={20}
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
              Generar práctica
            </button>
          </form>
        ) : practiceResult ? (
          <div>
            <ResultBanner result={practiceResult} />
            {practicePlan ? (
              <ReinforcementCard plan={practicePlan} basePath="/estudiante" />
            ) : (
              <p className="form-hint">Buen trabajo (70%+). Sigue practicando cuando quieras.</p>
            )}
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setPracticeSet(null)
                setPracticeResult(null)
                setPracticePlan(null)
              }}
            >
              Nueva práctica
            </button>
          </div>
        ) : (
          <ExerciseForm
            exercises={practiceSet}
            topicAnswerMode={topic.answerMode}
            submitLabel="Calificar"
            onSubmit={finishPractice}
          />
        )}
      </Modal>

      <Modal open={examOpen} title="Ingresar al examen" onClose={() => setExamOpen(false)}>
        <form className="form-stack" onSubmit={enterExam}>
          <label>
            Código de evaluación
            <input
              value={examCode}
              onChange={(e) => {
                setExamCode(e.target.value.toUpperCase())
                setExamError('')
              }}
              placeholder="Ej. A3K9MP"
              required
              maxLength={8}
            />
          </label>
          {examError ? <p className="form-error">{examError}</p> : null}
          <button type="submit" className="btn btn--primary">
            Entrar al examen
          </button>
        </form>
      </Modal>
    </div>
  )
}

function StudentExam() {
  const { code } = useParams()
  const {
    getEvaluationByCode,
    topics,
    addSubmission,
    hasStudentAttempted,
    isEvaluationOpen,
    recordReinforcement,
    online,
  } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const evaluation = useMemo(
    () => (code ? getEvaluationByCode(code) : undefined),
    [code, getEvaluationByCode],
  )
  const topic = topics.find((t) => t.id === evaluation?.topicId)
  const [result, setResult] = useState<PracticeResult | null>(null)
  const [plan, setPlan] = useState<ReinforcementPlan | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [answersDraft, setAnswersDraft] = useState<Record<string, string>>({})

  const blockedReason = useMemo(() => {
    if (!evaluation || !user) return 'Sesión no válida.'
    const open = isEvaluationOpen(evaluation)
    if (!open.open) return open.reason
    if (hasStudentAttempted(evaluation.code, user.id) && !result) {
      return 'Ya usaste tu único intento en esta evaluación.'
    }
    return null
  }, [evaluation, user, isEvaluationOpen, hasStudentAttempted, result])

  useEffect(() => {
    if (!evaluation || blockedReason || result) return
    setSecondsLeft(evaluation.timeLimitMinutes * 60)
  }, [evaluation, blockedReason, result])

  function finalize(answers: Record<string, string>, timedOut = false) {
    if (!evaluation || !user || result) return
    const graded = grade(evaluation.exercises, answers)
    const scorePercent = Math.round((graded.correct / graded.total) * 100)
    addSubmission({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      evaluationCode: evaluation.code,
      studentId: user.id,
      studentName: user.name,
      submittedAt: new Date().toISOString(),
      total: graded.total,
      correct: graded.correct,
      scorePercent,
      timedOut,
      pendingSync: !online,
      answers: graded.answers.map((a) => {
        const ex = evaluation.exercises.find((e) => e.id === a.exerciseId)!
        return {
          exerciseId: a.exerciseId,
          prompt: ex.prompt,
          expected: ex.answer,
          userAnswer: a.userAnswer,
          correct: a.correct,
        }
      }),
    })
    setResult(graded)
    setPlan(recordReinforcement(evaluation.topicId, scorePercent))
  }

  useEffect(() => {
    if (secondsLeft === null || result || blockedReason) return
    if (secondsLeft <= 0) {
      finalize(answersDraft, true)
      return
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => (s === null ? s : s - 1)), 1000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result, blockedReason])

  if (!evaluation) {
    return (
      <div className="actions-page">
        <p className="shell__empty">No se encontró la evaluación.</p>
        <button type="button" className="btn btn--ghost" onClick={() => navigate('/estudiante')}>
          Volver
        </button>
      </div>
    )
  }

  if (blockedReason && !result) {
    return (
      <div className="actions-page">
        <p className="shell__empty">{blockedReason}</p>
        <button type="button" className="btn btn--ghost" onClick={() => navigate('/estudiante')}>
          Volver
        </button>
      </div>
    )
  }

  const mm = secondsLeft === null ? '--' : String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = secondsLeft === null ? '--' : String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="actions-page exam-page">
      <div className="exam-timer" role="timer" aria-live="polite">
        Tiempo restante: {mm}:{ss}
      </div>
      <p className="exam-page__meta">
        Examen · {evaluation.topicTitle} · Código {evaluation.code} · 1 intento
      </p>
      <h1>Rendir evaluación</h1>
      <p className="actions-page__lead">
        {topic?.answerMode === 'escrito'
          ? 'Responde con el valor numérico (enteros).'
          : 'Elige la opción correcta en cada pregunta.'}
        {!online ? ' Estás offline: se enviará al reconectar.' : ''}
      </p>

      {result ? (
        <>
          <ResultBanner result={result} />
          {plan ? <ReinforcementCard plan={plan} basePath="/estudiante" /> : null}
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/estudiante')}>
            Volver al temario
          </button>
        </>
      ) : (
        <ExamLiveForm
          exercises={evaluation.exercises}
          topicAnswerMode={topic?.answerMode ?? 'escrito'}
          onChangeDraft={setAnswersDraft}
          onSubmit={(answers) => finalize(answers, false)}
        />
      )}
    </div>
  )
}

function ExamLiveForm({
  exercises,
  topicAnswerMode,
  onChangeDraft,
  onSubmit,
}: {
  exercises: Exercise[]
  topicAnswerMode: 'escrito' | 'opcion_multiple'
  onChangeDraft: (answers: Record<string, string>) => void
  onSubmit: (answers: Record<string, string>) => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  function update(next: Record<string, string>) {
    setAnswers(next)
    onChangeDraft(next)
  }

  return (
    <form
      className="exam-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(answers)
      }}
    >
      {exercises.map((ex, i) => {
        const mode = ex.options?.length ? 'opcion_multiple' : topicAnswerMode
        return (
          <fieldset key={ex.id} className="exam-item">
            <legend>
              {i + 1}. {ex.prompt}
            </legend>
            {mode === 'opcion_multiple' && ex.options ? (
              <div className="exam-options">
                {ex.options.map((opt) => (
                  <label key={opt} className="exam-option">
                    <input
                      type="radio"
                      name={ex.id}
                      value={opt}
                      checked={answers[ex.id] === opt}
                      onChange={() => update({ ...answers, [ex.id]: opt })}
                      required
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                placeholder="Escribe tu respuesta"
                value={answers[ex.id] ?? ''}
                onChange={(e) => update({ ...answers, [ex.id]: e.target.value })}
                required
              />
            )}
          </fieldset>
        )
      })}
      <button type="submit" className="btn btn--primary">
        Enviar examen
      </button>
    </form>
  )
}

export function StudentPage() {
  const { topics } = useApp()

  return (
    <div className="shell">
      <Sidebar
        topics={topics}
        basePath="/estudiante"
        title="Rol estudiante"
        extraLinks={[{ to: '/estudiante/ingresar-examen', label: 'Ingresar código examen' }]}
      />
      <div className="shell__content">
        <OfflineBanner />
        <SessionBar />
        <main className="shell__main">
          <Routes>
            <Route index element={<StudentWelcome />} />
            <Route path="ingresar-examen" element={<EnterExamByCode />} />
            <Route path="tema/:topicId" element={<StudentTopic />} />
            <Route path="tema/:topicId/acciones" element={<StudentActions />} />
            <Route path="examen/:code" element={<StudentExam />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
