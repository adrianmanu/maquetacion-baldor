import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export function RequireAuth({
  roles,
  children,
}: {
  roles: Role[]
  children: ReactNode
}) {
  const { user, homeFor } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />
  }

  return children
}
