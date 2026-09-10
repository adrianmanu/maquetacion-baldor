import type { Topic } from '../types'
import './VideoBlock.css'

export function VideoBlock({ topic }: { topic: Topic }) {
  const steps = topic.howToSolve.split('\n').filter(Boolean)

  return (
    <section className="video-block" aria-labelledby={`video-${topic.id}`}>
      <h2 id={`video-${topic.id}`}>Cómo se resuelve (video corto)</h2>
      <p className="video-block__title">{topic.videoTitle}</p>

      <div className="video-block__grid">
        <div className="video-block__frame-wrap">
          {topic.videoUrl ? (
            <iframe
              className="video-block__frame"
              src={topic.videoUrl}
              title={topic.videoTitle}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="video-block__placeholder">Video Santillana pendiente de carga</div>
          )}
        </div>

        <div className="video-block__anim" aria-label="Animacion de pasos">
          <p className="video-block__anim-label">Animacion de pasos</p>
          <ol>
            {steps.map((step, i) => (
              <li
                key={step}
                style={{ animationDelay: `${i * 0.35}s` }}
                className="video-block__step"
              >
                {step.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
