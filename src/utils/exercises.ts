import type { Difficulty, Exercise, Topic } from '../types'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function rangeByDifficulty(d: Difficulty) {
  if (d === 'facil') return { min: 1, max: 20 }
  if (d === 'medio') return { min: 10, max: 80 }
  return { min: 50, max: 200 }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function generateExercises(
  topic: Topic,
  count: number,
  difficulty: Difficulty,
): Exercise[] {
  const exercises: Exercise[] = []
  const { min, max } = rangeByDifficulty(difficulty)

  for (let i = 0; i < count; i++) {
    exercises.push(makeExercise(topic, difficulty, min, max))
  }
  return exercises
}

function makeExercise(
  topic: Topic,
  difficulty: Difficulty,
  min: number,
  max: number,
): Exercise {
  const id = uid()

  switch (topic.id) {
    case 'sumas': {
      const a = randInt(min, max)
      const b = randInt(min, max)
      return {
        id,
        topicId: topic.id,
        prompt: `Calcula: ${a} + ${b}`,
        answer: String(a + b),
        difficulty,
      }
    }
    case 'restas': {
      const a = randInt(min + 10, max)
      const b = randInt(min, a)
      return {
        id,
        topicId: topic.id,
        prompt: `Calcula: ${a} - ${b}`,
        answer: String(a - b),
        difficulty,
      }
    }
    case 'multiplicaciones': {
      const a = randInt(min, Math.min(max, difficulty === 'dificil' ? 50 : 25))
      const b = randInt(2, difficulty === 'facil' ? 10 : 20)
      return {
        id,
        topicId: topic.id,
        prompt: `Calcula: ${a} x ${b}`,
        answer: String(a * b),
        difficulty,
      }
    }
    case 'divisiones': {
      const b = randInt(2, difficulty === 'facil' ? 10 : 15)
      const q = randInt(min, Math.min(max, 40))
      const a = b * q
      return {
        id,
        topicId: topic.id,
        prompt: `Calcula: ${a} / ${b}`,
        answer: String(q),
        difficulty,
      }
    }
    case 'despejar-x': {
      const coef = randInt(2, 9)
      const x = randInt(min, Math.min(max, 30))
      const c = randInt(1, 20)
      const right = coef * x + c
      return {
        id,
        topicId: topic.id,
        prompt: `Despeja x: ${coef}x + ${c} = ${right}`,
        answer: String(x),
        difficulty,
      }
    }
    case 'ecuaciones': {
      const x = randInt(2, 15)
      const a = randInt(2, 6)
      const b = randInt(1, 10)
      const right = a * x + b
      const correct = `x = ${x}`
      const options = shuffle([
        correct,
        `x = ${x + 1}`,
        `x = ${x - 1}`,
        `x = ${a + b}`,
      ])
      return {
        id,
        topicId: topic.id,
        prompt: `Resuelve: ${a}x + ${b} = ${right}`,
        answer: correct,
        options,
        difficulty,
      }
    }
    case 'polinomios': {
      const a = randInt(1, 5)
      const b = randInt(1, 5)
      const correct = `${a + b}x^2`
      const options = shuffle([
        correct,
        `${a * b}x^2`,
        `${a + b}x`,
        `${Math.abs(a - b)}x^2`,
      ])
      return {
        id,
        topicId: topic.id,
        prompt: `Simplifica: ${a}x^2 + ${b}x^2`,
        answer: correct,
        options,
        difficulty,
      }
    }
    case 'factorizar':
    default: {
      const n = randInt(2, 9)
      const correct = `(x - ${n})(x + ${n})`
      const options = shuffle([
        correct,
        `(x - ${n})(x - ${n})`,
        `(x + ${n})(x + ${n})`,
        `x(x - ${n * n})`,
      ])
      return {
        id,
        topicId: topic.id,
        prompt: `Factoriza: x^2 - ${n * n}`,
        answer: correct,
        options,
        difficulty,
      }
    }
  }
}

export function generateEvalCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[randInt(0, chars.length - 1)]
  }
  return code
}
