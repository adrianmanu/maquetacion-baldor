import { useApp } from '../context/AppContext'
import './AppChrome.css'

export function OfflineBanner() {
  const { online, submissions, flushPendingSync } = useApp()
  const pending = submissions.filter((s) => s.pendingSync).length

  if (online && pending === 0) return null

  return (
    <div
      className={online ? 'banner banner--sync' : 'banner banner--offline'}
      role="status"
      aria-live="polite"
    >
      {online ? (
        <>
          Conexion restaurada. {pending} entrega(s) pendientes de sync.
          <button type="button" onClick={flushPendingSync}>
            Sincronizar ahora
          </button>
        </>
      ) : (
        <>
          Modo offline activo. Puedes estudiar y practicar; los examenes se
          guardan y se sincronizan al volver la red.
        </>
      )}
    </div>
  )
}
