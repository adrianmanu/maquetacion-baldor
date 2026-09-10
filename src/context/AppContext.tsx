import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { INITIAL_TOPICS } from '../data/topics'
import type {
  Evaluation,
  ExamSubmission,
  ReinforcementPlan,
  Topic,
} from '../types'

const STORAGE_TOPICS = 'baldor-topics-v2'
const STORAGE_EVALS = 'baldor-evaluations-v2'
const STORAGE_SUBS = 'baldor-submissions-v2'
const STORAGE_REINFORCE = 'baldor-reinforce-v1'

function migrateTopic(raw: Partial<Topic> & { id: string; title: string }): Topic {
  const base = INITIAL_TOPICS.find((t) => t.id === raw.id)
  return {
    id: raw.id,
    title: raw.title,
    category: raw.category ?? base?.category ?? 'General',
    answerMode: raw.answerMode ?? base?.answerMode ?? 'escrito',
    whatIs: raw.whatIs ?? base?.whatIs ?? '',
    howToSolve: raw.howToSolve ?? base?.howToSolve ?? '',
    example: raw.example ?? base?.example ?? '',
    videoUrl: raw.videoUrl ?? base?.videoUrl ?? '',
    videoTitle: raw.videoTitle ?? base?.videoTitle ?? `Cómo se resuelve: ${raw.title}`,
    prerequisiteIds: raw.prerequisiteIds ?? base?.prerequisiteIds ?? [],
  }
}

function loadTopics(): Topic[] {
  try {
    const raw = localStorage.getItem(STORAGE_TOPICS)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Topic>[]
      return parsed.filter((t) => t.id && t.title).map((t) => migrateTopic(t as Topic))
    }
  } catch {
    /* ignore */
  }
  return INITIAL_TOPICS
}

function loadEvals(): Evaluation[] {
  try {
    const raw = localStorage.getItem(STORAGE_EVALS)
    if (raw) {
      const parsed = JSON.parse(raw) as Evaluation[]
      return parsed.map((e) => ({
        ...e,
        expiresAt: e.expiresAt ?? new Date(Date.now() + 7 * 86400000).toISOString(),
        timeLimitMinutes: e.timeLimitMinutes ?? 30,
        closed: e.closed ?? false,
        createdBy: e.createdBy ?? 'u-docente',
      }))
    }
  } catch {
    /* ignore */
  }
  return []
}

function loadSubs(): ExamSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUBS)
    if (raw) return JSON.parse(raw) as ExamSubmission[]
  } catch {
    /* ignore */
  }
  return []
}

function loadReinforce(): ReinforcementPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_REINFORCE)
    if (raw) return JSON.parse(raw) as ReinforcementPlan[]
  } catch {
    /* ignore */
  }
  return []
}

function buildReinforcement(topic: Topic, scorePercent: number): ReinforcementPlan {
  const recommended = [...topic.prerequisiteIds]
  if (scorePercent < 50 && !recommended.includes(topic.id)) {
    recommended.push(topic.id)
  }
  return {
    topicId: topic.id,
    scorePercent,
    recommendedTopicIds: recommended.length ? recommended : [topic.id],
    message:
      scorePercent < 50
        ? `Nota baja (${scorePercent}%). Te recomendamos reforzar los temas previos y volver a practicar ${topic.title}.`
        : `Nota ${scorePercent}%. Repasa estos temas para consolidar ${topic.title}.`,
    createdAt: new Date().toISOString(),
  }
}

interface AppContextValue {
  topics: Topic[]
  evaluations: Evaluation[]
  submissions: ExamSubmission[]
  reinforcements: ReinforcementPlan[]
  online: boolean
  upsertTopic: (topic: Topic) => void
  deleteTopic: (id: string) => void
  addEvaluation: (evaluation: Evaluation) => void
  updateEvaluation: (code: string, patch: Partial<Evaluation>) => void
  getEvaluationByCode: (code: string) => Evaluation | undefined
  addSubmission: (submission: ExamSubmission) => void
  getSubmissionsByCode: (code: string) => ExamSubmission[]
  hasStudentAttempted: (code: string, studentId: string) => boolean
  isEvaluationOpen: (evaluation: Evaluation) => { open: boolean; reason?: string }
  recordReinforcement: (topicId: string, scorePercent: number) => ReinforcementPlan | null
  getLatestReinforcement: (studentTopicHint?: string) => ReinforcementPlan | null
  flushPendingSync: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>(loadTopics)
  const [evaluations, setEvaluations] = useState<Evaluation[]>(loadEvals)
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(loadSubs)
  const [reinforcements, setReinforcements] = useState<ReinforcementPlan[]>(loadReinforce)
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const upsertTopic = useCallback((topic: Topic) => {
    setTopics((prev) => {
      const exists = prev.some((t) => t.id === topic.id)
      const next = exists
        ? prev.map((t) => (t.id === topic.id ? topic : t))
        : [...prev, topic]
      localStorage.setItem(STORAGE_TOPICS, JSON.stringify(next))
      return next
    })
  }, [])

  const deleteTopic = useCallback((id: string) => {
    setTopics((prev) => {
      const next = prev.filter((t) => t.id !== id)
      localStorage.setItem(STORAGE_TOPICS, JSON.stringify(next))
      return next
    })
  }, [])

  const addEvaluation = useCallback((evaluation: Evaluation) => {
    setEvaluations((prev) => {
      const next = [evaluation, ...prev]
      localStorage.setItem(STORAGE_EVALS, JSON.stringify(next))
      return next
    })
  }, [])

  const updateEvaluation = useCallback((code: string, patch: Partial<Evaluation>) => {
    setEvaluations((prev) => {
      const next = prev.map((e) =>
        e.code.toUpperCase() === code.toUpperCase() ? { ...e, ...patch } : e,
      )
      localStorage.setItem(STORAGE_EVALS, JSON.stringify(next))
      return next
    })
  }, [])

  const getEvaluationByCode = useCallback(
    (code: string) =>
      evaluations.find((e) => e.code.toUpperCase() === code.toUpperCase()),
    [evaluations],
  )

  const addSubmission = useCallback((submission: ExamSubmission) => {
    setSubmissions((prev) => {
      const next = [submission, ...prev]
      localStorage.setItem(STORAGE_SUBS, JSON.stringify(next))
      return next
    })
  }, [])

  const getSubmissionsByCode = useCallback(
    (code: string) =>
      submissions.filter(
        (s) => s.evaluationCode.toUpperCase() === code.toUpperCase(),
      ),
    [submissions],
  )

  const hasStudentAttempted = useCallback(
    (code: string, studentId: string) =>
      submissions.some(
        (s) =>
          s.evaluationCode.toUpperCase() === code.toUpperCase() &&
          s.studentId === studentId,
      ),
    [submissions],
  )

  const isEvaluationOpen = useCallback((evaluation: Evaluation) => {
    if (evaluation.closed) {
      return { open: false, reason: 'El docente cerró el aula para esta evaluación.' }
    }
    if (new Date(evaluation.expiresAt).getTime() < Date.now()) {
      return { open: false, reason: 'El código de evaluación está vencido.' }
    }
    return { open: true }
  }, [])

  const recordReinforcement = useCallback(
    (topicId: string, scorePercent: number) => {
      if (scorePercent >= 70) return null
      const topic = topics.find((t) => t.id === topicId)
      if (!topic) return null
      const plan = buildReinforcement(topic, scorePercent)
      setReinforcements((prev) => {
        const next = [plan, ...prev].slice(0, 20)
        localStorage.setItem(STORAGE_REINFORCE, JSON.stringify(next))
        return next
      })
      return plan
    },
    [topics],
  )

  const getLatestReinforcement = useCallback(() => reinforcements[0] ?? null, [reinforcements])

  const flushPendingSync = useCallback(() => {
    setSubmissions((prev) => {
      const next = prev.map((s) =>
        s.pendingSync ? { ...s, pendingSync: false } : s,
      )
      localStorage.setItem(STORAGE_SUBS, JSON.stringify(next))
      return next
    })
  }, [])

  useEffect(() => {
    if (online) flushPendingSync()
  }, [online, flushPendingSync])

  const value = useMemo(
    () => ({
      topics,
      evaluations,
      submissions,
      reinforcements,
      online,
      upsertTopic,
      deleteTopic,
      addEvaluation,
      updateEvaluation,
      getEvaluationByCode,
      addSubmission,
      getSubmissionsByCode,
      hasStudentAttempted,
      isEvaluationOpen,
      recordReinforcement,
      getLatestReinforcement,
      flushPendingSync,
    }),
    [
      topics,
      evaluations,
      submissions,
      reinforcements,
      online,
      upsertTopic,
      deleteTopic,
      addEvaluation,
      updateEvaluation,
      getEvaluationByCode,
      addSubmission,
      getSubmissionsByCode,
      hasStudentAttempted,
      isEvaluationOpen,
      recordReinforcement,
      getLatestReinforcement,
      flushPendingSync,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
