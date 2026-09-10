import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { ReinforcementPlan } from '../types'
import './ReinforcementCard.css'

export function ReinforcementCard({
  plan,
  basePath,
}: {
  plan: ReinforcementPlan
  basePath: string
}) {
  const { topics } = useApp()
  const recommended = plan.recommendedTopicIds
    .map((id) => topics.find((t) => t.id === id))
    .filter(Boolean)

  return (
    <aside className="reinforce" role="complementary" aria-label="Ruta de refuerzo">
      <h2>Ruta de refuerzo</h2>
      <p>{plan.message}</p>
      <ul>
        {recommended.map((t) =>
          t ? (
            <li key={t.id}>
              <Link to={`${basePath}/tema/${t.id}`}>{t.title}</Link>
              <span> — ver contenido y video</span>
            </li>
          ) : null,
        )}
      </ul>
      <Link className="btn btn--primary" to={`${basePath}/tema/${plan.topicId}/acciones`}>
        Volver a practicar
      </Link>
    </aside>
  )
}
