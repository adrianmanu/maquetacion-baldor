export type Role = 'admin' | 'docente' | 'estudiante' | 'padre' | 'backoffice'

export type AnswerMode = 'escrito' | 'opcion_multiple'

export type Difficulty = 'facil' | 'medio' | 'dificil'

export interface Topic {
  id: string
  title: string
  category: string
  answerMode: AnswerMode
  whatIs: string
  howToSolve: string
  example: string
  /** Video corto tipo Santillana (YouTube embed o URL) */
  videoUrl: string
  videoTitle: string
  /** Temas previos recomendados para refuerzo */
  prerequisiteIds: string[]
}

export interface Exercise {
  id: string
  topicId: string
  prompt: string
  answer: string
  options?: string[]
  difficulty: Difficulty
}

export interface Evaluation {
  code: string
  topicId: string
  topicTitle: string
  difficulty: Difficulty
  exercises: Exercise[]
  createdAt: string
  /** ISO date when code expires */
  expiresAt: string
  /** Minutes allowed once exam starts */
  timeLimitMinutes: number
  /** Classroom closed by teacher */
  closed: boolean
  createdBy: string
}

export interface PracticeResult {
  total: number
  correct: number
  answers: { exerciseId: string; userAnswer: string; correct: boolean }[]
}

export interface ExamSubmission {
  id: string
  evaluationCode: string
  studentId: string
  studentName: string
  submittedAt: string
  total: number
  correct: number
  scorePercent: number
  timedOut?: boolean
  answers: {
    exerciseId: string
    prompt: string
    expected: string
    userAnswer: string
    correct: boolean
  }[]
  /** Queued while offline */
  pendingSync?: boolean
}

export interface UserAccount {
  id: string
  email: string
  password: string
  name: string
  role: Role
  /** For padre: linked student ids */
  childIds?: string[]
  /** For estudiante: grade/section */
  grade?: string
  active: boolean
}

export interface ReinforcementPlan {
  topicId: string
  scorePercent: number
  recommendedTopicIds: string[]
  message: string
  createdAt: string
}
