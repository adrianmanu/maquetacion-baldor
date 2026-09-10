import type { UserAccount } from '../types'

/** Cuentas demo del colegio (login real en maquetación con localStorage). */
export const SEED_USERS: UserAccount[] = [
  {
    id: 'u-admin',
    email: 'admin@colegio.edu',
    password: 'admin123',
    name: 'María Admin',
    role: 'admin',
    active: true,
  },
  {
    id: 'u-backoffice',
    email: 'contenido@santillana.com',
    password: 'back123',
    name: 'Equipo Contenido',
    role: 'backoffice',
    active: true,
  },
  {
    id: 'u-docente',
    email: 'docente@colegio.edu',
    password: 'doc123',
    name: 'Prof. Carlos Rivera',
    role: 'docente',
    active: true,
  },
  {
    id: 'u-docente-2',
    email: 'ana.docente@colegio.edu',
    password: 'doc123',
    name: 'Prof. Ana López',
    role: 'docente',
    active: true,
  },
  {
    id: 'u-est-1',
    email: 'estudiante@colegio.edu',
    password: 'est123',
    name: 'Lucía Pérez',
    role: 'estudiante',
    grade: '3° Secundaria A',
    active: true,
  },
  {
    id: 'u-est-2',
    email: 'juan.est@colegio.edu',
    password: 'est123',
    name: 'Juan Torres',
    role: 'estudiante',
    grade: '3° Secundaria A',
    active: true,
  },
  {
    id: 'u-padre',
    email: 'padre@colegio.edu',
    password: 'pad123',
    name: 'Roberto Pérez',
    role: 'padre',
    childIds: ['u-est-1'],
    active: true,
  },
]

export const ROLE_HOME: Record<UserAccount['role'], string> = {
  admin: '/admin',
  backoffice: '/backoffice',
  docente: '/docente',
  estudiante: '/estudiante',
  padre: '/padres',
}
