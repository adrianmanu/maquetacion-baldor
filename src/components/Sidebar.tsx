import { NavLink } from 'react-router-dom'
import type { Topic } from '../types'
import './Sidebar.css'

interface SidebarProps {
  topics: Topic[]
  basePath: string
  title: string
  extraLinks?: { to: string; label: string }[]
}

export function Sidebar({ topics, basePath, title, extraLinks = [] }: SidebarProps) {
  const grouped = topics.reduce<Record<string, Topic[]>>((acc, t) => {
    acc[t.category] = acc[t.category] ?? []
    acc[t.category].push(t)
    return acc
  }, {})

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark">B</span>
        <div>
          <p className="sidebar__product">Baldor</p>
          <p className="sidebar__role">{title}</p>
        </div>
      </div>

      {extraLinks.length > 0 ? (
        <div className="sidebar__extra">
          {extraLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'sidebar__link is-active' : 'sidebar__link'
              }
              end
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      ) : null}

      <nav className="sidebar__nav" aria-label="Temario">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="sidebar__group">
            <p className="sidebar__category">{category}</p>
            <ul>
              {items.map((topic) => (
                <li key={topic.id}>
                  <NavLink
                    to={`${basePath}/tema/${topic.id}`}
                    className={({ isActive }) =>
                      isActive ? 'sidebar__link is-active' : 'sidebar__link'
                    }
                  >
                    {topic.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <NavLink to="/" className="sidebar__home">
        Cambiar de rol
      </NavLink>
    </aside>
  )
}
