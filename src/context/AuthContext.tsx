import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ROLE_HOME, SEED_USERS } from '../data/users'
import type { UserAccount } from '../types'

const STORAGE_USERS = 'baldor-users'
const STORAGE_SESSION = 'baldor-session'

function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS)
    if (raw) return JSON.parse(raw) as UserAccount[]
  } catch {
    /* ignore */
  }
  localStorage.setItem(STORAGE_USERS, JSON.stringify(SEED_USERS))
  return SEED_USERS
}

function loadSession(): UserAccount | null {
  try {
    const id = localStorage.getItem(STORAGE_SESSION)
    if (!id) return null
    const users = loadUsers()
    return users.find((u) => u.id === id && u.active) ?? null
  } catch {
    return null
  }
}

interface AuthContextValue {
  user: UserAccount | null
  users: UserAccount[]
  login: (email: string, password: string) => { ok: true; home: string } | { ok: false; error: string }
  logout: () => void
  upsertUser: (account: UserAccount) => void
  setUserActive: (id: string, active: boolean) => void
  homeFor: (role: UserAccount['role']) => string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(loadUsers)
  const [user, setUser] = useState<UserAccount | null>(loadSession)

  const persistUsers = useCallback((next: UserAccount[]) => {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(next))
    setUsers(next)
  }, [])

  const login = useCallback(
    (email: string, password: string) => {
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password,
      )
      if (!found) return { ok: false as const, error: 'Correo o contraseña incorrectos.' }
      if (!found.active) return { ok: false as const, error: 'Cuenta desactivada. Contacta al admin.' }
      localStorage.setItem(STORAGE_SESSION, found.id)
      setUser(found)
      return { ok: true as const, home: ROLE_HOME[found.role] }
    },
    [users],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_SESSION)
    setUser(null)
  }, [])

  const upsertUser = useCallback(
    (account: UserAccount) => {
      const exists = users.some((u) => u.id === account.id)
      const next = exists
        ? users.map((u) => (u.id === account.id ? account : u))
        : [...users, account]
      persistUsers(next)
      if (user?.id === account.id) setUser(account)
    },
    [persistUsers, user?.id, users],
  )

  const setUserActive = useCallback(
    (id: string, active: boolean) => {
      const next = users.map((u) => (u.id === id ? { ...u, active } : u))
      persistUsers(next)
      if (user?.id === id && !active) {
        localStorage.removeItem(STORAGE_SESSION)
        setUser(null)
      }
    },
    [persistUsers, user?.id, users],
  )

  const homeFor = useCallback((role: UserAccount['role']) => ROLE_HOME[role], [])

  const value = useMemo(
    () => ({
      user,
      users,
      login,
      logout,
      upsertUser,
      setUserActive,
      homeFor,
    }),
    [user, users, login, logout, upsertUser, setUserActive, homeFor],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
