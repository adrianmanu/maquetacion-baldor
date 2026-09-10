import type { ReactNode } from 'react'
import type { Topic } from '../types'
import { VideoBlock } from './VideoBlock'
import './TopicPanel.css'

interface TopicPanelProps {
  topic: Topic
  actions?: ReactNode
}

export function TopicPanel({ topic, actions }: TopicPanelProps) {
  return (
    <article className="topic-panel">
      <header className="topic-panel__header">
        <p className="topic-panel__eyebrow">{topic.category}</p>
        <h1>{topic.title}</h1>
        <p className="topic-panel__mode">
          Tipo de respuesta en examen:{' '}
          <strong>
            {topic.answerMode === 'escrito' ? 'Escrita (número)' : 'Opción múltiple'}
          </strong>
        </p>
      </header>

      <section className="topic-panel__block">
        <h2>¿Qué es?</h2>
        <p>{topic.whatIs}</p>
      </section>

      <section className="topic-panel__block">
        <h2>¿Cómo se resuelve?</h2>
        <pre className="topic-panel__steps">{topic.howToSolve}</pre>
      </section>

      <section className="topic-panel__block topic-panel__example">
        <h2>Ejemplo</h2>
        <p>{topic.example}</p>
      </section>

      <VideoBlock topic={topic} />

      {actions ? <div className="topic-panel__actions">{actions}</div> : null}
    </article>
  )
}
